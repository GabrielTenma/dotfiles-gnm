const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Settings } = Me.imports.services.Settings;
var WorkspaceNames = class WorkspaceNames {
    constructor(_ws) {
        this._ws = _ws;
        this._settings = Settings.getInstance();
    }
    static init(workspaces) {
        this._instance = new WorkspaceNames(workspaces);
        return this._instance;
    }
    static getInstance() {
        return this._instance;
    }
    moveByIndex(oldIndex, newIndex) {
        const workspaceNames = this._getNames();
        const [element] = workspaceNames.splice(oldIndex, 1);
        if (newIndex < workspaceNames.length) {
            workspaceNames.splice(newIndex, 0, element ?? '');
        }
        else {
            setArrayValue(workspaceNames, newIndex, element ?? '');
        }
        this._setNames(workspaceNames);
    }
    remove(index) {
        const workspaceNames = this._getNames();
        workspaceNames.splice(index, 1);
        this._setNames(workspaceNames);
    }
    rename(index, newName) {
        let workspaceNames = this._getNames();
        const oldName = workspaceNames[index];
        setArrayValue(workspaceNames, index, newName);
        this._setNames(workspaceNames);
        if (this._settings.smartWorkspaceNames.value && newName) {
            this._saveSmartWorkspaceName(index, oldName, newName);
        }
    }
    restoreSmartWorkspaceName(index) {
        const windowNames = this._getWindowNames(index);
        const workspacesNamesMap = this._settings.workspaceNamesMap.value;
        for (const windowName of windowNames) {
            if (workspacesNamesMap[windowName]?.length > 0) {
                const newName = workspacesNamesMap[windowName].find((name) => !this._getEnabledWorkspaceNames().includes(name));
                if (newName) {
                    let workspaceNames = this._getNames();
                    while (workspaceNames.length < index) {
                        workspaceNames.push('');
                    }
                    workspaceNames[index] = newName;
                    this._setNames(workspaceNames);
                    return;
                }
            }
        }
    }
    _saveSmartWorkspaceName(index, oldName, newName) {
        const windowNames = this._getWindowNames(index);
        const workspacesNamesMap = this._settings.workspaceNamesMap.value;
        for (const windowName of windowNames) {
            workspacesNamesMap[windowName] = [
                ...(workspacesNamesMap[windowName] ?? [])
                    // Clear our unused names.
                    .filter((name) => name !== newName && this._getEnabledWorkspaceNames().includes(name)),
                newName,
            ];
        }
        this._settings.workspaceNamesMap.value = workspacesNamesMap;
    }
    _getWindowNames(workspaceIndex) {
        const workspace = global.workspace_manager.get_workspace_by_index(workspaceIndex);
        let windows = workspace.list_windows();
        windows = windows.filter((window) => !window.is_on_all_workspaces());
        return windows.map((window) => window.get_wm_class());
    }
    _getNames() {
        return [...this._settings.workspaceNames.value];
    }
    _setNames(names) {
        this._settings.workspaceNames.value = names;
    }
    _getEnabledWorkspaceNames() {
        return this._getNames().filter((_, index) => index < this._ws.numberOfEnabledWorkspaces);
    }
}
/**
 * Sets the array's value at the given index, padding any missing elements so all elements have
 * valid values.
 */
function setArrayValue(array, index, value) {
    while (array.length < index) {
        array.push('');
    }
    array[index] = value;
}
