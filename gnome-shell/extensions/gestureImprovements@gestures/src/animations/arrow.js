// import GObject from '@gi-types/gobject2';
/* exported ArrowIconAnimation */
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { registerClass } = Me.imports.common.utils.gobject;
const { easeActor } = Me.imports.src.utils.environment;
const { WIGET_SHOWING_DURATION } = Me.imports.constants;
const ExtMe = imports.misc.extensionUtils.getCurrentExtension();
const Util = imports.misc.util;
const Circle = registerClass(class GIE_Circle extends St.Widget {
	_init(style_class) {
		style_class = `gie-circle ${style_class}`;
		super._init({ style_class });
		this.set_pivot_point(0.5, 0.5);
	}
});

var ArrowIconAnimation = registerClass(class GIE_ArrowIcon extends St.Widget {
	_init() {
		super._init();
		this._inner_circle = new Circle('gie-inner-circle');
		this._outer_circle = new Circle('gie-outer-circle');
		this._arrow_icon = new St.Icon({ style_class: 'gie-arrow-icon' });
		this._inner_circle.set_clip_to_allocation(true);
		this._inner_circle.add_child(this._arrow_icon);
		this.add_child(this._outer_circle);
		this.add_child(this._inner_circle);
	}

	gestureBegin(icon_name, from_left) {
		this._transition = {
			arrow: {
				from: this._inner_circle.width * (from_left ? -1 : 1),
				end: 0,
			},
			outer_circle: {
				from: 1,
				end: 2,
			},
		};

		this._arrow_icon.translation_x = this._transition.arrow.from;
		this._outer_circle.scale_x = this._transition.outer_circle.from;
		this._outer_circle.scale_y = this._outer_circle.scale_x;
		this._arrow_icon.opacity = 255;

		// animating showing widget
		this.opacity = 0;
		this.show();
		easeActor(this, {
			opacity: 255,
			mode: Clutter.AnimationMode.EASE_OUT_QUAD,
			duration: WIGET_SHOWING_DURATION,
		});

		this._arrow_icon.set_gicon(Gio.Icon.new_for_string(`${ExtMe.dir.get_uri()}/assets/${icon_name}`));
	}

	gestureUpdate(progress) {
		if (this._transition === undefined)
			return;
		this._arrow_icon.translation_x = Util.lerp(this._transition.arrow.from, this._transition.arrow.end, progress);
		this._outer_circle.scale_x = Util.lerp(this._transition.outer_circle.from, this._transition.outer_circle.end, progress);
		this._outer_circle.scale_y = this._outer_circle.scale_x;
	}

	gestureEnd(duration, progress, callback) {
		if (this._transition === undefined)
			return;
		easeActor(this, {
			opacity: 0,
			mode: Clutter.AnimationMode.EASE_OUT_QUAD,
			duration,
		});

		const translation_x = Util.lerp(this._transition.arrow.from, this._transition.arrow.end, progress);
		easeActor(this._arrow_icon, {
			translation_x,
			duration,
			mode: Clutter.AnimationMode.EASE_OUT_EXPO,
			onStopped: () => {
				callback();
				this.hide();
				this._arrow_icon.opacity = 0;
				this._arrow_icon.translation_x = 0;
				this._outer_circle.scale_x = 1;
				this._outer_circle.scale_y = 1;
			},
		});

		const scale = Util.lerp(this._transition.outer_circle.from, this._transition.outer_circle.end, progress);
		easeActor(this._outer_circle, {
			scale_x: scale,
			scale_y: scale,
			duration,
			mode: Clutter.AnimationMode.EASE_OUT_EXPO,
		});
	}
});
