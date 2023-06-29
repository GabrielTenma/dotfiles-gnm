/* exported ShowDesktopExtension */
const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { TouchpadPinchGesture } = Me.imports.src.trackers.pinchTracker;
const { easeActor } = Me.imports.src.utils.environment;
const Main = imports.ui.main;
const Layout = imports.ui.layout;
const { lerp } = imports.misc.util;

// declare enum 
var WorkspaceManagerState;
(function (WorkspaceManagerState) {
	WorkspaceManagerState[WorkspaceManagerState['DEFAULT'] = 0] = 'DEFAULT';
	WorkspaceManagerState[WorkspaceManagerState['SHOW_DESKTOP'] = 1] = 'SHOW_DESKTOP';
})(WorkspaceManagerState || (WorkspaceManagerState = {}));

// declare enum
var ExtensionState;
(function (ExtensionState) {
	ExtensionState[ExtensionState['DEFAULT'] = 0] = 'DEFAULT';
	ExtensionState[ExtensionState['ANIMATING'] = 1] = 'ANIMATING';
})(ExtensionState || (ExtensionState = {}));

class MonitorGroup {
	constructor(monitor) {
		this._windowActorClones = [];
		this.monitor = monitor;
		this._container = new Clutter.Actor({ visible: false });
		const constraint = new Layout.MonitorConstraint({ index: monitor.index });
		this._container.add_constraint(constraint);
		this._bottomMidCorner = { x: this.monitor.width / 2, y: this.monitor.height, position: 'bottom-mid' };
		this._corners = [
			{ x: 0, y: 0, position: 'top-left' },

			// { x: this.monitor.width / 2, y: 0, position: 'top-mid' },
			{ x: this.monitor.width, y: 0, position: 'top-right' },
			{ x: this.monitor.width, y: this.monitor.height, position: 'bottom-right' },

			// { x: this.monitor.width / 2, y: this.monitor.height, position: 'bottom-mid' },
			{ x: 0, y: this.monitor.height, position: 'bottom-left' },
		];

		this._container.set_clip_to_allocation(true);
		Main.layoutManager.uiGroup.insert_child_above(this._container, global.window_group);
	}

	_addWindowActor(windowActor) {
		const clone = new Clutter.Clone({
			source: windowActor,
			x: windowActor.x - this.monitor.x,
			y: windowActor.y - this.monitor.y,
		});

		// windowActor.opacity = 0;
		windowActor.hide();
		this._windowActorClones.push({ clone, windowActor });
		this._container.insert_child_below(clone, null);
	}

	_getDestPoint(clone, destCorner) {
		const destY = destCorner.y;
		const cloneRelXCenter = Math.round(clone.width / 2);
		switch (destCorner.position) {
			case 'top-left':
				return { x: destCorner.x - clone.width, y: destY - clone.height };
			case 'top-mid':
				return { x: destCorner.x - cloneRelXCenter, y: destY - clone.height };
			case 'top-right':
				return { x: destCorner.x, y: destY - clone.height };
			case 'bottom-right':
				return { x: destCorner.x, y: destY };
			case 'bottom-mid':
				return { x: destCorner.x - cloneRelXCenter, y: destY };
			case 'bottom-left':
				return { x: destCorner.x - clone.width, y: destY };
		}
	}

	_calculateDist(p, q) {
		return Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
	}

	_assignCorner(actorClone, corner) {
		const { clone } = actorClone;
		const destPoint = this._getDestPoint(clone, corner);
		actorClone.translation = {
			start: { x: clone.x, y: clone.y },
			end: { x: destPoint.x, y: destPoint.y },
		};
	}

	_fillCloneDestPosition(windowActorsClones) {
		if (windowActorsClones.length === 0)
			return;
		if (windowActorsClones.length === 1) {
			this._assignCorner(windowActorsClones[0], this._bottomMidCorner);
			return;
		}

		const distanceMetrics = [];
		this._corners.forEach(corner => {
			windowActorsClones.forEach(actorClone => {
				distanceMetrics.push({
					value: this._calculateDist(actorClone.clone, this._getDestPoint(actorClone.clone, corner)),
					actorClone,
					corner,
				});
			});
		});

		const minActorsPerCorner = Math.floor(windowActorsClones.length / this._corners.length);
		let extraActors = windowActorsClones.length - this._corners.length * minActorsPerCorner;
		const clusterSizes = new Map();
		const takenActorClones = new Set();
		distanceMetrics.sort((a, b) => a.value - b.value);
		distanceMetrics.forEach(metric => {
			var _a;
			const size = (_a = clusterSizes.get(metric.corner.position)) !== null && _a !== void 0 ? _a : 0;
			if (takenActorClones.has(metric.actorClone))
				return;
			if (size >= minActorsPerCorner) {
				if (size > minActorsPerCorner || extraActors <= 0)
					return;
				extraActors -= 1;
			}

			takenActorClones.add(metric.actorClone);
			clusterSizes.set(metric.corner.position, size + 1);
			this._assignCorner(metric.actorClone, metric.corner);
		});
	}

	gestureBegin(windowActors) {
		windowActors.forEach(this._addWindowActor.bind(this));
		this._fillCloneDestPosition(this._windowActorClones);
		this._container.show();
	}

	gestureUpdate(progress) {
		this._windowActorClones.forEach(actorClone => {
			const { clone, translation } = actorClone;
			if (translation === undefined)
				return;
			clone.x = lerp(translation.start.x, translation.end.x, progress);
			clone.y = lerp(translation.start.y, translation.end.y, progress);
			clone.opacity = lerp(255, 128, progress);
		});
	}

	gestureEnd(progress, duration) {
		this._windowActorClones.forEach(actorClone => {
			const { clone, translation, windowActor } = actorClone;
			if (translation === undefined) {
				clone.destroy();
				return;
			}

			easeActor(clone, {
				x: lerp(translation.start.x, translation.end.x, progress),
				y: lerp(translation.start.y, translation.end.y, progress),
				opacity: lerp(255, 128, progress),
				mode: Clutter.AnimationMode.EASE_OUT_QUAD,
				duration,
				onStopped: () => {
					this._container.hide();
					const window = windowActor.meta_window;
					if (window === null || window === void 0 ? void 0 : window.can_minimize()) {
						Main.wm.skipNextEffect(windowActor);
						if (progress === WorkspaceManagerState.DEFAULT) {
							window.unminimize();
							windowActor.show();
						}
						else {
							window.minimize();
							windowActor.hide();
						}
					}
					else {
						windowActor.show();
					}

					clone.destroy();
				},
			});
		});

		if (this._windowActorClones.length === 0)
			this._container.hide();
		this._windowActorClones = [];
	}

	destroy() {
		this._container.destroy();
	}
}

var ShowDesktopExtension = class ShowDesktopExtension {
	constructor(nfingers) {
		this._windows = new Set();
		this._workspaceChangedId = 0;
		this._windowAddedId = 0;
		this._windowRemovedId = 0;
		this._windowUnMinimizedId = 0;
		this._monitorChangedId = 0;
		this._extensionState = ExtensionState.DEFAULT;
		this._minimizingWindows = [];
		this._workspaceManagerState = WorkspaceManagerState.DEFAULT;
		this._monitorGroups = [];
		this._pinchTracker = new TouchpadPinchGesture({
			nfingers: nfingers,
			allowedModes: Shell.ActionMode.NORMAL,
		});
	}

	apply() {
		this._pinchTracker.connect('begin', this.gestureBegin.bind(this));
		this._pinchTracker.connect('update', this.gestureUpdate.bind(this));
		this._pinchTracker.connect('end', this.gestureEnd.bind(this));
		for (const monitor of Main.layoutManager.monitors)
			this._monitorGroups.push(new MonitorGroup(monitor));
		this._workspaceChangedId = global.workspace_manager.connect('active-workspace-changed', this._workspaceChanged.bind(this));
		this._workspaceChanged();
		this._windowUnMinimizedId = global.window_manager.connect('unminimize', this._windowUnMinimized.bind(this));
		this._monitorChangedId = Main.layoutManager.connect('monitors-changed', () => {
			this._monitorGroups.forEach(m => m.destroy());
			this._monitorGroups = [];
			for (const monitor of Main.layoutManager.monitors)
				this._monitorGroups.push(new MonitorGroup(monitor));
		});
	}

	destroy() {
		var _a, _b, _c;
		(_a = this._pinchTracker) === null || _a === void 0 ? void 0 : _a.destroy();
		if (this._monitorChangedId)
			Main.layoutManager.disconnect(this._monitorChangedId);
		if (this._windowAddedId)
			(_b = this._workspace) === null || _b === void 0 ? void 0 : _b.disconnect(this._windowAddedId);
		if (this._windowRemovedId)
			(_c = this._workspace) === null || _c === void 0 ? void 0 : _c.disconnect(this._windowRemovedId);
		if (this._workspaceChangedId)
			global.workspace_manager.disconnect(this._workspaceChangedId);
		if (this._windowUnMinimizedId)
			global.window_manager.disconnect(this._windowUnMinimizedId);
		this._resetState();
		for (const monitor of this._monitorGroups)
			monitor.destroy();
		this._monitorGroups = [];
	}

	_getMinimizableWindows() {
		if (this._workspaceManagerState === WorkspaceManagerState.DEFAULT) {
			this._minimizingWindows = global
				.get_window_actors()
				.filter(a => a.visible)

			// top actors should be at the beginning
				.reverse()
				.map(actor => actor.meta_window)
				.filter(win => {
					var _a;
					return win.get_window_type() !== Meta.WindowType.DESKTOP &&
                    this._windows.has(win) &&
                    (win.is_always_on_all_workspaces() || win.get_workspace().index === ((_a = this._workspace) === null || _a === void 0 ? void 0 : _a.index)) &&
                    !win.minimized;
				});
		}

		return this._minimizingWindows;
	}

	gestureBegin(tracker) {
		this._extensionState = ExtensionState.ANIMATING;
		Meta.disable_unredirect_for_display(global.display);
		this._minimizingWindows = this._getMinimizableWindows();

		// this._setDesktopWindowsBelow();
		for (const monitor of this._monitorGroups) {
			const windowActors = this._minimizingWindows
				.map(win => win.get_compositor_private())
				.filter((actor) => {
					return actor instanceof Meta.WindowActor && actor.meta_window.get_monitor() === monitor.monitor.index;
				});

			monitor.gestureBegin(windowActors);
		}

		tracker.confirmPinch(1, [WorkspaceManagerState.DEFAULT, WorkspaceManagerState.SHOW_DESKTOP], this._workspaceManagerState);
	}

	gestureUpdate(_tracker, progress) {
		// progress 0 -> NORMAL state, 1 -> SHOW Desktop
		// printStack();
		for (const monitor of this._monitorGroups)
			monitor.gestureUpdate(progress);
	}

	gestureEnd(_tracker, duration, endProgress) {
		// endProgress 0 -> NORMAL state, 1 -> SHOW Desktop
		for (const monitor of this._monitorGroups)
			monitor.gestureEnd(endProgress, duration);
		if (endProgress === WorkspaceManagerState.DEFAULT)
			this._minimizingWindows = [];
		this._extensionState = ExtensionState.DEFAULT;
		this._workspaceManagerState = endProgress;
		Meta.enable_unredirect_for_display(global.display);
	}

	_resetState(animate = false) {
		// reset state, aka. undo show desktop
		this._minimizingWindows.forEach(win => {
			if (!this._windows.has(win))
				return;
			const onStopped = () => {
				Main.wm.skipNextEffect(win.get_compositor_private());
				win.unminimize();
			};

			const actor = win.get_compositor_private();
			if (animate && actor) {
				actor.show();
				actor.opacity = 0;
				easeActor(actor, {
					opacity: 255,
					duration: 500,
					mode: Clutter.AnimationMode.EASE_OUT_QUAD,
					onStopped,
				});
			}
			else
				onStopped();
		});

		this._minimizingWindows = [];
		this._workspaceManagerState = WorkspaceManagerState.DEFAULT;
	}

	_workspaceChanged() {
		var _a, _b;
		if (this._windowAddedId)
			(_a = this._workspace) === null || _a === void 0 ? void 0 : _a.disconnect(this._windowAddedId);
		if (this._windowRemovedId)
			(_b = this._workspace) === null || _b === void 0 ? void 0 : _b.disconnect(this._windowRemovedId);
		this._resetState(false);
		this._windows.clear();
		this._workspace = global.workspace_manager.get_active_workspace();
		this._windowAddedId = this._workspace.connect('window-added', this._windowAdded.bind(this));
		this._windowRemovedId = this._workspace.connect('window-removed', this._windowRemoved.bind(this));
		this._workspace.list_windows().forEach(win => this._windowAdded(this._workspace, win));
	}

	_windowAdded(_workspace, window) {
		if (this._windows.has(window))
			return;
		if (!window.skip_taskbar && this._extensionState === ExtensionState.DEFAULT)
			this._resetState(true);
		this._windows.add(window);
	}

	_windowRemoved(_workspace, window) {
		if (!this._windows.has(window))
			return;
		this._windows.delete(window);
	}

	_windowUnMinimized(_wm, actor) {
		var _a;
		if (actor.meta_window.get_workspace().index !== ((_a = this._workspace) === null || _a === void 0 ? void 0 : _a.index))
			return;
		this._minimizingWindows = [];
		this._workspaceManagerState = WorkspaceManagerState.DEFAULT;
	}
};
