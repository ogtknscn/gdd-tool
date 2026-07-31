use serde::Serialize;
use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
};
use tauri::Manager;

fn pdf_lines(snapshot: &Value) -> Vec<String> {
    let mut lines = vec![format!("GDD Tool - {}", snapshot.get("title").and_then(Value::as_str).unwrap_or("Project"))];
    if let Some(objects) = snapshot.get("objects").and_then(Value::as_array) { for object in objects { let title = object.get("title").and_then(Value::as_str).unwrap_or("Untitled"); let kind = object.get("kind").and_then(Value::as_str).unwrap_or("item"); let summary = object.get("summary").and_then(Value::as_str).unwrap_or(""); lines.push(format!("{} [{}]", title, kind)); if !summary.is_empty() { lines.push(format!("  {}", summary)); } } }
    lines
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenedProject {
    snapshot: Value,
    path: String,
}
#[derive(Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecentProject {
    path: String,
    title: String,
    opened_at: String,
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
fn recent_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("recent-projects.json"))
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
fn clear_project_snapshot(app: tauri::AppHandle) -> Result<(), String> {
    let target = autosave_path(&app)?;
    if target.exists() {
        fs::remove_file(target).map_err(|error| error.to_string())?;
    }
    Ok(())
}
#[tauri::command]
fn load_recent_projects(app: tauri::AppHandle) -> Result<Vec<RecentProject>, String> {
    let target = recent_path(&app)?;
    if !target.exists() {
        return Ok(vec![]);
    }
    serde_json::from_str(&fs::read_to_string(target).map_err(|error| error.to_string())?)
        .map_err(|error| error.to_string())
}
#[tauri::command]
fn remember_recent_project(app: tauri::AppHandle, recent: RecentProject) -> Result<(), String> {
    let mut items = load_recent_projects(app.clone())?;
    items.retain(|item| item.path != recent.path);
    items.insert(0, recent);
    items.truncate(12);
    write_json_atomically(
        &recent_path(&app)?,
        &serde_json::to_value(items).map_err(|error| error.to_string())?,
    )
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
fn open_recent_project(path: String) -> Result<Option<OpenedProject>, String> {
    let path = PathBuf::from(path);
    if !path.is_file() {
        return Ok(None);
    }
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
#[tauri::command]
fn export_project_pdf(app: tauri::AppHandle, snapshot: Value) -> Result<String, String> {
    use printpdf::{BuiltinFont, Mm, Op, PdfDocument, PdfPage, PdfSaveOptions, Point, Pt, TextItem};
    let lines = pdf_lines(&snapshot); if lines.iter().any(|line| !line.is_ascii()) { return Err("Bu projede Unicode karakterler var; yerel Unicode PDF fontu yapılandırılmadı. PDF dışa aktarma güvenle durduruldu.".to_string()); } let title = snapshot.get("title").and_then(Value::as_str).unwrap_or("gdd-project").to_string();
    let mut doc = PdfDocument::new(&title); let mut pages = Vec::new(); let mut ops = vec![Op::StartTextSection, Op::SetFontSizeBuiltinFont { size: Pt(15.0), font: BuiltinFont::Helvetica }, Op::SetTextCursor { pos: Point::new(Mm(18.0), Mm(280.0)) }]; let mut y = 280.0_f32;
    for (index, line) in lines.into_iter().enumerate() { if index == 1 { ops.push(Op::SetFontSizeBuiltinFont { size: Pt(10.0), font: BuiltinFont::Helvetica }); } if y < 20.0 { ops.push(Op::EndTextSection); pages.push(PdfPage::new(Mm(210.0), Mm(297.0), ops)); ops = vec![Op::StartTextSection, Op::SetFontSizeBuiltinFont { size: Pt(10.0), font: BuiltinFont::Helvetica }, Op::SetTextCursor { pos: Point::new(Mm(18.0), Mm(280.0)) }]; y = 280.0; } ops.push(Op::WriteTextBuiltinFont { items: vec![TextItem::Text(line)], font: BuiltinFont::Helvetica }); ops.push(Op::AddLineBreak); y -= 6.0; }
    ops.push(Op::EndTextSection); pages.push(PdfPage::new(Mm(210.0), Mm(297.0), ops)); let bytes = doc.with_pages(pages).save(&PdfSaveOptions::default(), &mut Vec::new()); let directory = app.path().app_data_dir().map_err(|error| error.to_string())?.join("exports"); fs::create_dir_all(&directory).map_err(|error| error.to_string())?; let path = directory.join(format!("{}.pdf", title.replace(['\\', '/', ':'], "-"))); fs::write(&path, bytes).map_err(|error| error.to_string())?; Ok(path.to_string_lossy().into_owned())
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_project_snapshot,
            load_project_snapshot,
            clear_project_snapshot,
            load_recent_projects,
            remember_recent_project,
            open_project_file,
            open_recent_project,
            save_project_file,
            export_project_pdf
        ])
        .run(tauri::generate_context!())
        .expect("error while running GDD Tool");
}
