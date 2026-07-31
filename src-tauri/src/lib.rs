use serde::Serialize;
use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
};
use tauri::Manager;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenedProject {
    snapshot: Value,
    path: String,
}

#[cfg(windows)]
fn replace_atomically(temp: &Path, target: &Path) -> Result<(), String> {
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::Storage::FileSystem::{
        MoveFileExW, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH,
    };
    let temp_wide: Vec<u16> = temp.as_os_str().encode_wide().chain(Some(0)).collect();
    let target_wide: Vec<u16> = target.as_os_str().encode_wide().chain(Some(0)).collect();
    let result = unsafe {
        MoveFileExW(
            temp_wide.as_ptr(),
            target_wide.as_ptr(),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
    };
    if result == 0 {
        return Err(std::io::Error::last_os_error().to_string());
    }
    Ok(())
}
#[cfg(not(windows))]
fn replace_atomically(temp: &Path, target: &Path) -> Result<(), String> {
    fs::rename(temp, target).map_err(|error| error.to_string())
}

fn write_json_atomically(target: &Path, snapshot: &Value) -> Result<(), String> {
    if let Some(parent) = target.parent() {
        if !parent.as_os_str().is_empty() {
            fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }
    }
    let temp = target.with_extension("gdd.tmp");
    fs::write(
        &temp,
        serde_json::to_vec_pretty(snapshot).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;
    replace_atomically(&temp, target)
}
fn autosave_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("autosave.gdd.json"))
}

#[cfg(windows)]
fn choose_project_file(save: bool) -> Option<PathBuf> {
    use std::{mem, os::windows::ffi::OsStringExt};
    use windows_sys::Win32::UI::Controls::Dialogs::{
        GetOpenFileNameW, GetSaveFileNameW, OFN_FILEMUSTEXIST, OFN_OVERWRITEPROMPT,
        OFN_PATHMUSTEXIST, OPENFILENAMEW,
    };
    let mut buffer = [0u16; 32768];
    if save {
        for (index, unit) in "oyun-tasarimi.gdd.json".encode_utf16().enumerate() {
            buffer[index] = unit;
        }
    }
    let filter: Vec<u16> = "GDD Tool projesi (*.gdd.json)\0*.gdd.json\0JSON (*.json)\0*.json\0\0"
        .encode_utf16()
        .collect();
    let default_extension: Vec<u16> = "gdd.json\0".encode_utf16().collect();
    let mut dialog: OPENFILENAMEW = unsafe { mem::zeroed() };
    dialog.lStructSize = mem::size_of::<OPENFILENAMEW>() as u32;
    dialog.lpstrFilter = filter.as_ptr();
    dialog.nFilterIndex = 1;
    dialog.lpstrFile = buffer.as_mut_ptr();
    dialog.nMaxFile = buffer.len() as u32;
    dialog.lpstrDefExt = default_extension.as_ptr();
    dialog.Flags = OFN_PATHMUSTEXIST
        | if save {
            OFN_OVERWRITEPROMPT
        } else {
            OFN_FILEMUSTEXIST
        };
    let accepted = unsafe {
        if save {
            GetSaveFileNameW(&mut dialog)
        } else {
            GetOpenFileNameW(&mut dialog)
        }
    };
    if accepted == 0 {
        return None;
    }
    let length = buffer
        .iter()
        .position(|unit| *unit == 0)
        .unwrap_or(buffer.len());
    Some(PathBuf::from(std::ffi::OsString::from_wide(
        &buffer[..length],
    )))
}

#[cfg(not(windows))]
fn choose_project_file(_save: bool) -> Option<PathBuf> {
    None
}

#[tauri::command]
fn save_project_snapshot(app: tauri::AppHandle, snapshot: Value) -> Result<(), String> {
    write_json_atomically(&autosave_path(&app)?, &snapshot)
}
#[tauri::command]
fn load_project_snapshot(app: tauri::AppHandle) -> Result<Option<Value>, String> {
    let target = autosave_path(&app)?;
    if !target.exists() {
        return Ok(None);
    }
    serde_json::from_str(&fs::read_to_string(target).map_err(|error| error.to_string())?)
        .map(Some)
        .map_err(|error| error.to_string())
}
#[tauri::command]
fn open_project_file() -> Result<Option<OpenedProject>, String> {
    let Some(path) = choose_project_file(false) else {
        return Ok(None);
    };
    let snapshot =
        serde_json::from_str(&fs::read_to_string(&path).map_err(|error| error.to_string())?)
            .map_err(|error| error.to_string())?;
    Ok(Some(OpenedProject {
        snapshot,
        path: path.to_string_lossy().into_owned(),
    }))
}
#[tauri::command]
fn save_project_file(snapshot: Value, path: Option<String>) -> Result<Option<String>, String> {
    let target = match path {
        Some(value) => PathBuf::from(value),
        None => {
            let Some(value) = choose_project_file(true) else {
                return Ok(None);
            };
            value
        }
    };
    write_json_atomically(&target, &snapshot)?;
    Ok(Some(target.to_string_lossy().into_owned()))
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_project_snapshot,
            load_project_snapshot,
            open_project_file,
            save_project_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running GDD Tool");
}
