/* eslint-disable no-unused-vars */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

var DASH_TO_PANEL_UUID = 'dash-to-panel@jderose9.github.com';
var AZTASKBAR_UUID = 'aztaskbar@aztaskbar.gitlab.com';

var SearchbarLocation = {
    BOTTOM: 0,
    TOP: 1,
};

var MenuItemLocation = {
    BOTTOM: 0,
    TOP: 1,
};

var DisplayType = {
    LIST: 0,
    GRID: 1,
    BUTTON: 2,
};

var AvatarStyle = {
    ROUND: 0,
    SQUARE: 1,
};

var CategoryType = {
    FAVORITES: 0,
    FREQUENT_APPS: 1,
    ALL_PROGRAMS: 2,
    PINNED_APPS: 3,
    RECENT_FILES: 4,
    HOME_SCREEN: 5,
    SEARCH_RESULTS: 6,
    CATEGORIES_LIST: 7,
};

var DefaultMenuView = {
    PINNED_APPS: 0,
    CATEGORIES_LIST: 1,
    FREQUENT_APPS: 2,
    ALL_PROGRAMS: 3,
};

var SettingsPage = {
    MAIN: 0,
    MENU_LAYOUT: 1,
    BUTTON_APPEARANCE: 2,
    LAYOUT_TWEAKS: 3,
    ABOUT: 4,
    CUSTOMIZE_MENU: 5,
    RUNNER_TWEAKS: 6,
    GENERAL: 7,
    MENU_THEME: 8,
    DIRECTORY_SHORTCUTS: 9,
    APPLICATION_SHORTCUTS: 10,
    SEARCH_OPTIONS: 11,
    POWER_OPTIONS: 12,
    EXTRA_CATEGORIES: 13,
    PINNED_APPS: 14,
};

var DefaultMenuViewTognee = {
    CATEGORIES_LIST: 0,
    ALL_PROGRAMS: 1,
};

var DefaultMenuViewRedmond = {
    ALL_PROGRAMS: 0,
    PINNED_APPS: 1,
};

var SoftwareManagerIDs = ['org.manjaro.pamac.manager.desktop', 'pamac-manager.desktop',
    'io.elementary.appcenter.desktop', 'snap-store_ubuntu-software.desktop', 'snap-store_snap-store.desktop',
    'org.gnome.Software.desktop'];

var Categories = [
    {CATEGORY: CategoryType.FAVORITES, NAME: _('Favorites'), ICON: 'emblem-favorite-symbolic'},
    {CATEGORY: CategoryType.FREQUENT_APPS, NAME: _('Frequent Apps'), ICON: 'user-bookmarks-symbolic'},
    {CATEGORY: CategoryType.ALL_PROGRAMS, NAME: _('All Apps'), ICON: 'view-app-grid-symbolic'},
    {CATEGORY: CategoryType.PINNED_APPS, NAME: _('Pinned Apps'), ICON: 'view-pin-symbolic'},
    {CATEGORY: CategoryType.RECENT_FILES, NAME: _('Recent Files'), ICON: 'document-open-recent-symbolic'},
];

var TooltipLocation = {
    TOP_CENTERED: 0,
    BOTTOM_CENTERED: 1,
    BOTTOM: 2,
};

var ContextMenuLocation = {
    DEFAULT: 0,
    BOTTOM_CENTERED: 1,
    RIGHT: 2,
};

var SeparatorAlignment = {
    VERTICAL: 0,
    HORIZONTAL: 1,
};

var SeparatorStyle = {
    SHORT: 0,
    MEDIUM: 1,
    LONG: 2,
    MAX: 3,
    HEADER_LABEL: 4,
    NORMAL: 5,
};

var CaretPosition = {
    END: -1,
    START: 0,
    MIDDLE: 2,
};

var CategoryIconType = {
    FULL_COLOR: 0,
    SYMBOLIC: 1,
};

var ForcedMenuLocation = {
    OFF: 0,
    TOP_CENTERED: 1,
    BOTTOM_CENTERED: 2,
};

var IconSize = {
    DEFAULT: 0,
    EXTRA_SMALL: 1,
    SMALL: 2,
    MEDIUM: 3,
    LARGE: 4,
    EXTRA_LARGE: 5,
    HIDDEN: 6,
};

var GridIconSize = {
    DEFAULT: 0,
    SMALL: 1,
    MEDIUM: 2,
    LARGE: 3,
    SMALL_RECT: 4,
    MEDIUM_RECT: 5,
    LARGE_RECT: 6,
};

var GridIconInfo = [
    {NAME: 'SmallIconGrid', SIZE: 90, ICON_SIZE: 36, ENUM: GridIconSize.SMALL},
    {NAME: 'MediumIconGrid', SIZE: 97, ICON_SIZE: 42, ENUM: GridIconSize.MEDIUM},
    {NAME: 'LargeIconGrid', SIZE: 105, ICON_SIZE: 52, ENUM: GridIconSize.LARGE},
    {NAME: 'SmallRectIconGrid', SIZE: 95, ICON_SIZE: 28, ENUM: GridIconSize.SMALL_RECT},
    {NAME: 'MediumRectIconGrid', SIZE: 102, ICON_SIZE: 34, ENUM: GridIconSize.MEDIUM_RECT},
    {NAME: 'LargeRectIconGrid', SIZE: 105, ICON_SIZE: 42, ENUM: GridIconSize.LARGE_RECT},
];

var ICON_HIDDEN = 0;
var EXTRA_SMALL_ICON_SIZE = 16;
var SMALL_ICON_SIZE = 20;
var MEDIUM_ICON_SIZE = 25;
var LARGE_ICON_SIZE = 30;
var EXTRA_LARGE_ICON_SIZE = 35;
var MISC_ICON_SIZE = 24;

var SUPER_L = 'Super_L';

var HotkeyType = {
    SUPER_L: 0,
    CUSTOM: 1,
};

var SECTIONS = [
    'devices',
    'network',
    'bookmarks',
];

var Direction = {
    GO_NEXT: 0,
    GO_PREVIOUS: 1,
};

var MenuPosition = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
};

var RavenPosition = {
    LEFT: 0,
    RIGHT: 1,
};

var DiaglogType = {
    DEFAULT: 0,
    OTHER: 1,
    APPLICATIONS: 2,
    DIRECTORIES: 3,
};

var MenuSettingsListType = {
    PINNED_APPS: 0,
    APPLICATIONS: 1,
    DIRECTORIES: 2,
    EXTRA_SHORTCUTS: 3,
    POWER_OPTIONS: 4,
    EXTRA_CATEGORIES: 5,
    QUICK_LINKS: 6,
    CONTEXT_MENU: 7,
};

var MenuButtonAppearance = {
    ICON: 0,
    TEXT: 1,
    ICON_TEXT: 2,
    TEXT_ICON: 3,
    NONE: 4,
};

var PowerType = {
    LOGOUT: 0,
    LOCK: 1,
    RESTART: 2,
    POWER_OFF: 3,
    SUSPEND: 4,
    HYBRID_SLEEP: 5,
    HIBERNATE: 6,
    SWITCH_USER: 7,
};

var PowerDisplayStyle = {
    DEFAULT: 0,
    IN_LINE: 1,
    MENU: 2,
};

var PowerOptions = [
    {TYPE: PowerType.LOGOUT, ICON: 'system-log-out-symbolic', NAME: _('Log Out...')},
    {TYPE: PowerType.LOCK, ICON: 'changes-prevent-symbolic', NAME: _('Lock')},
    {TYPE: PowerType.RESTART, ICON: 'system-reboot-symbolic', NAME: _('Restart...')},
    {TYPE: PowerType.POWER_OFF, ICON: 'system-shutdown-symbolic', NAME: _('Power Off...')},
    {TYPE: PowerType.SUSPEND, ICON: 'media-playback-pause-symbolic', NAME: _('Suspend')},
    {TYPE: PowerType.HYBRID_SLEEP, ICON: 'weather-clear-night-symbolic', NAME: _('Hybrid Sleep')},
    {TYPE: PowerType.HIBERNATE, ICON: 'document-save-symbolic', NAME: _('Hibernate')},
    {TYPE: PowerType.SWITCH_USER, ICON: 'system-switch-user-symbolic', NAME: _('Switch User')},
];

// Icon type for the menu button
// set 'menu-button-icon' enum setting to value of desired icon type.
var MenuIconType = {
    MENU_ICON: 0,
    DISTRO_ICON: 1,
    CUSTOM: 2,
};

// Object order in MenuIcons array corresponds to the integer value of 'arc-menu-icon' setting
// i.e 'arc-menu-icon' value of 0 is arcmenu-logo-symbolic.
var MenuIcons = [
    {PATH: 'icon-arcmenu-logo-symbolic'},
    {PATH: 'icon-arcmenu-logo-alt-symbolic'},
    {PATH: 'icon-arcmenu-old-symbolic'},
    {PATH: 'icon-arcmenu-old-alt-symbolic'},
    {PATH: 'icon-arcmenu-oldest-symbolic'},
    {PATH: 'icon-curved-a-symbolic'},
    {PATH: 'icon-focus-symbolic'},
    {PATH: 'icon-triple-dash-symbolic'},
    {PATH: 'icon-whirl-symbolic'},
    {PATH: 'icon-whirl-circle-symbolic'},
    {PATH: 'icon-sums-symbolic'},
    {PATH: 'icon-arrow-symbolic'},
    {PATH: 'icon-lins-symbolic'},
    {PATH: 'icon-diamond-square-symbolic'},
    {PATH: 'icon-octo-maze-symbolic'},
    {PATH: 'icon-search-glass-symbolic'},
    {PATH: 'icon-transform-symbolic'},
    {PATH: 'icon-toxic2-symbolic'},
    {PATH: 'icon-alien-symbolic'},
    {PATH: 'icon-cloud-symbolic'},
    {PATH: 'icon-dragon-symbolic'},
    {PATH: 'icon-fly-symbolic'},
    {PATH: 'icon-pacman-symbolic'},
    {PATH: 'icon-peaks-symbolic'},
    {PATH: 'icon-pie-symbolic'},
    {PATH: 'icon-pointer-symbolic'},
    {PATH: 'icon-toxic-symbolic'},
    {PATH: 'icon-tree-symbolic'},
    {PATH: 'icon-zegon-symbolic'},
    {PATH: 'icon-apps-symbolic'},
    {PATH: 'icon-bug-symbolic'},
    {PATH: 'icon-cita-symbolic'},
    {PATH: 'icon-dragonheart-symbolic'},
    {PATH: 'icon-eclipse-symbolic'},
    {PATH: 'icon-football-symbolic'},
    {PATH: 'icon-heddy-symbolic'},
    {PATH: 'icon-helmet-symbolic'},
    {PATH: 'icon-paint-palette-symbolic'},
    {PATH: 'icon-peeks-symbolic'},
    {PATH: 'icon-record-symbolic'},
    {PATH: 'icon-saucer-symbolic'},
    {PATH: 'icon-step-symbolic'},
    {PATH: 'icon-vancer-symbolic'},
    {PATH: 'icon-vibe-symbolic'},
    {PATH: 'icon-start-box-symbolic'},
    {PATH: 'icon-dimond-win-symbolic'},
    {PATH: 'icon-dolphin-symbolic'},
    {PATH: 'icon-dota-symbolic'},
    {PATH: 'icon-football2-symbolic'},
    {PATH: 'icon-loveheart-symbolic'},
    {PATH: 'icon-pyrimid-symbolic'},
    {PATH: 'icon-rewind-symbolic'},
    {PATH: 'icon-snap-symbolic'},
    {PATH: 'icon-time-symbolic'},
    {PATH: 'icon-3d-symbolic'},
    {PATH: 'icon-a-symbolic'},
    {PATH: 'icon-app-launcher-symbolic'},
    {PATH: 'icon-bat-symbolic'},
    {PATH: 'icon-dra-symbolic'},
    {PATH: 'icon-equal-symbolic'},
    {PATH: 'icon-gnacs-symbolic'},
    {PATH: 'icon-groove-symbolic'},
    {PATH: 'icon-kaaet-symbolic'},
    {PATH: 'icon-launcher-symbolic'},
    {PATH: 'icon-pac-symbolic'},
    {PATH: 'icon-robots-symbolic'},
    {PATH: 'icon-sheild-symbolic'},
    {PATH: 'icon-somnia-symbolic'},
    {PATH: 'icon-utool-symbolic'},
    {PATH: 'icon-swirl-symbolic'},
    {PATH: 'icon-round-symbolic'},
    {PATH: 'view-app-grid-symbolic'},
];

// Object order in DistroIcons array corresponds to the integer value of 'distro-icon' setting
// i.e 'distro-icon' value of 3 is manjaro-logo.
var DistroIcons = [
    {PATH: 'distro-gnome-symbolic', NAME: 'GNOME'},
    {PATH: 'distro-debian-symbolic', NAME: 'Debian'},
    {PATH: 'distro-fedora-symbolic', NAME: 'Fedora'},
    {PATH: 'distro-manjaro-symbolic', NAME: 'Manjaro'},
    {PATH: 'distro-pop-os-symbolic', NAME: 'Pop!_OS'},
    {PATH: 'distro-ubuntu-symbolic', NAME: 'Ubuntu'},
    {PATH: 'distro-arch-symbolic', NAME: 'Arch'},
    {PATH: 'distro-opensuse-symbolic', NAME: 'OpenSUSE'},
    {PATH: 'distro-raspbian-symbolic', NAME: 'Raspbian'},
    {PATH: 'distro-kali-linux-symbolic', NAME: 'Kali Linux'},
    {PATH: 'distro-pureos-symbolic', NAME: 'PureOS'},
    {PATH: 'distro-solus-symbolic', NAME: 'Solus'},
    {PATH: 'distro-budgie-symbolic', NAME: 'Budgie'},
    {PATH: 'distro-gentoo-symbolic', NAME: 'Gentoo'},
    {PATH: 'distro-mx-symbolic', NAME: 'MX Linux'},
    {PATH: 'distro-redhat-symbolic', NAME: 'Redhat'},
    {PATH: 'distro-voyager-symbolic', NAME: 'Voyager'},
    {PATH: 'distro-zorin-symbolic', NAME: 'Zorin OS'},
    {PATH: 'distro-endeavour-symbolic', NAME: 'Endeavour'},
    {PATH: 'distro-nobara-symbolic', NAME: 'Nobara'},
    {PATH: 'distro-pardus-symbolic', NAME: 'Pardus'},
    {PATH: 'distro-cachyos-symbolic', NAME: 'CachyOS'},
];

var MenuLayout = {
    ARCMENU: 0,
    BRISK: 1,
    WHISKER: 2,
    GNOME_MENU: 3,
    MINT: 4,
    ELEMENTARY: 5,
    GNOME_OVERVIEW: 6,
    REDMOND: 7,
    UNITY: 8,
    BUDGIE: 9,
    INSIDER: 10,
    RUNNER: 11,
    CHROMEBOOK: 12,
    RAVEN: 13,
    TOGNEE: 14,
    PLASMA: 15,
    WINDOWS: 16,
    ELEVEN: 17,
    AZ: 18,
    ENTERPRISE: 19,
};

var TraditionalMenus = [
    {
        LAYOUT: MenuLayout.ARCMENU,
        TITLE: _('ArcMenu'),
        IMAGE: 'menu-arcmenu-symbolic',
    },
    {
        LAYOUT: MenuLayout.BRISK,
        TITLE: _('Brisk'),
        IMAGE: 'menu-brisk-symbolic',
    },
    {
        LAYOUT: MenuLayout.WHISKER,
        TITLE: _('Whisker'),
        IMAGE: 'menu-whisker-symbolic',
    },
    {
        LAYOUT: MenuLayout.GNOME_MENU,
        TITLE: _('GNOME Menu'),
        IMAGE: 'menu-gnomemenu-symbolic',
    },
    {
        LAYOUT: MenuLayout.MINT,
        TITLE: _('Mint'),
        IMAGE: 'menu-mint-symbolic',
    },
    {
        LAYOUT: MenuLayout.BUDGIE,
        TITLE: _('Budgie'),
        IMAGE: 'menu-budgie-symbolic',
    },
];

var ModernMenus = [
    {
        LAYOUT: MenuLayout.UNITY,
        TITLE: _('Unity'),
        IMAGE: 'menu-unity-symbolic',
    },
    {
        LAYOUT: MenuLayout.PLASMA,
        TITLE: _('Plasma'),
        IMAGE: 'menu-plasma-symbolic',
    },
    {
        LAYOUT: MenuLayout.TOGNEE,
        TITLE: _('tognee'),
        IMAGE: 'menu-tognee-symbolic',
    },
    {
        LAYOUT: MenuLayout.INSIDER,
        TITLE: _('Insider'),
        IMAGE: 'menu-insider-symbolic',
    },
    {
        LAYOUT: MenuLayout.REDMOND,
        TITLE: _('Redmond'),
        IMAGE: 'menu-redmond-symbolic',
    },
    {
        LAYOUT: MenuLayout.WINDOWS,
        TITLE: _('Windows'),
        IMAGE: 'menu-windows-symbolic',
    },
    {
        LAYOUT: MenuLayout.ELEVEN,
        TITLE: _('11'),
        IMAGE: 'menu-eleven-symbolic',
    },
    {
        LAYOUT: MenuLayout.AZ,
        TITLE: _('a.z.'),
        IMAGE: 'menu-az-symbolic',
    },
    {
        LAYOUT: MenuLayout.ENTERPRISE,
        TITLE: _('Enterprise'),
        IMAGE: 'menu-enterprise-symbolic',
    },
];

var TouchMenus = [
    {
        LAYOUT: MenuLayout.ELEMENTARY,
        TITLE: _('Elementary'),
        IMAGE: 'menu-elementary-symbolic',
    },
    {
        LAYOUT: MenuLayout.CHROMEBOOK,
        TITLE: _('Chromebook'),
        IMAGE: 'menu-chromebook-symbolic',
    },
];

var LauncherMenus = [
    {
        LAYOUT: MenuLayout.RUNNER,
        TITLE: _('Runner'),
        IMAGE: 'menu-runner-symbolic',
    },
    {
        LAYOUT: MenuLayout.GNOME_OVERVIEW,
        TITLE: _('GNOME Overview'),
        IMAGE: 'menu-gnomeoverview-symbolic',
    },
];

var AlternativeMenus = [
    {
        LAYOUT: MenuLayout.RAVEN,
        TITLE: _('Raven'),
        IMAGE: 'menu-raven-symbolic',
    },
];

var MenuStyles = [
    {
        MENU_TYPE: TraditionalMenus,
        TITLE: _('Traditional'),
        IMAGE: 'menustyle-traditional-symbolic',
    },
    {
        MENU_TYPE: ModernMenus,
        TITLE: _('Modern'),
        IMAGE: 'menustyle-modern-symbolic',
    },
    {
        MENU_TYPE: TouchMenus,
        TITLE: _('Touch'),
        IMAGE: 'menustyle-touch-symbolic',
    },
    {
        MENU_TYPE: LauncherMenus,
        TITLE: _('Launcher'),
        IMAGE: 'menustyle-launcher-symbolic',
    },
    {
        MENU_TYPE: AlternativeMenus,
        TITLE: _('Alternative'),
        IMAGE: 'menustyle-alternative-symbolic',
    },
];

var ArcMenuLogoSymbolic = `${Me.path}/icons/arcmenu-logo-symbolic.svg`;

var TranslatableSettingsStrings = [_('Software'), _('Settings'), _('Tweaks'), _('Terminal'),
    _('Activities Overview'), _('ArcMenu Settings'), _('Files')];

var ShortcutCommands = {
    SUSPEND: 'ArcMenu_Suspend',
    LOG_OUT: 'ArcMenu_LogOut',
    POWER_OFF: 'ArcMenu_PowerOff',
    LOCK: 'ArcMenu_Lock',
    RESTART: 'ArcMenu_Restart',
    HYBRID_SLEEP: 'ArcMenu_HybridSleep',
    HIBERNATE: 'ArcMenu_Hibernate',
    SWITCH_USER: 'ArcMenu_SwitchUser',
    COMPUTER: 'ArcMenu_Computer',
    NETWORK: 'ArcMenu_Network',
    RECENT: 'ArcMenu_Recent',
    SOFTWARE: 'ArcMenu_Software',
    HOME: 'ArcMenu_Home',
    DOCUMENTS: 'ArcMenu_Documents',
    DOWNLOADS: 'ArcMenu_Downloads',
    MUSIC: 'ArcMenu_Music',
    PICTURES: 'ArcMenu_Pictures',
    VIDEOS: 'ArcMenu_Videos',
    ARCMENU_SETTINGS: 'gnome-extensions prefs arcmenu@arcmenu.com',
    FOLDER: 'ArcMenu_Folder',
    OVERVIEW: 'ArcMenu_ActivitiesOverview',
    SHOW_APPS: 'ArcMenu_ShowAllApplications',
    RUN_COMMAND: 'ArcMenu_RunCommand',
    SEPARATOR: 'ArcMenu_Separator',
    SETTINGS: 'ArcMenu_Settings',
    SHOW_DESKTOP: 'ArcMenu_ShowDesktop',
    POWER_OPTIONS: 'ArcMenu_PowerOptions',
    SETTINGS_MENU: 'ArcMenu_SettingsMenu',
    SETTINGS_LAYOUT: 'ArcMenu_SettingsLayout',
    SETTINGS_BUTTON: 'ArcMenu_SettingsButton',
    SETTINGS_ABOUT: 'ArcMenu_SettingsAbout',
    SETTINGS_THEME: 'ArcMenu_SettingsTheme',
    PANEL_EXTENSION_SETTINGS: 'ArcMenu_PanelExtensionSettings',
    ARCMENU_ICON: 'ArcMenu_ArcMenuIcon',
};

var DistroIconsDisclaimer = '<i>All brand icons are trademarks of their respective owners.' +
            ' The use of these trademarks does not indicate endorsement of the trademark holder ' +
            'by ArcMenu project, nor vice versa.' +
            ' Please do not use brand logos for any purpose except to represent the company, ' +
            'product, or service to which they refer.</i>' +
    '\n\n•   <b>GNOME®</b> - The GNOME name and logo are trademarks of the GNOME Foundation.' +
    '\n\n•   <b>Ubuntu®</b> - Ubuntu name and Ubuntu logo are trademarks of Canonical© Ltd.' +
    '\n\n•   <b>Fedora®</b> - Fedora and the Infinity design logo are trademarks of Red Hat, Inc.' +
    '\n\n•   <b>Debian®</b> - is a registered trademark owned by Software in the Public Interest.' +
    '\n\n•   <b>Manjaro®</b> - logo and name are trademarks of Manjaro GmbH &amp; Co. KG' +
    '\n\n•   <b>Pop_OS!®</b> - logo and name are trademarks of system 76© Inc.' +
    '\n\n•   <b>Arch Linux™</b> - The stylized Arch Linux logo is a recognized trademark of Arch Linux, ' +
                'copyright 2002–2017 Judd Vinet and Aaron Griffin.' +
    '\n\n•   <b>openSUSE®</b> - logo and name 2001–2020 SUSE LLC, © 2005–2020 openSUSE Contributors &amp; others.' +
    '\n\n•   <b>Raspberry Pi®</b> - logo and name are part of Raspberry Pi Foundation UK Registered Charity 1129409' +
    '\n\n•   <b>Kali Linux™</b> - logo and name are part of © OffSec Services Limited 2020' +
    '\n\n•   <b>PureOS</b> - logo and name are developed by members of the Purism community' +
    '\n\n•   <b>Solus</b> - logo and name are copyright © 2014–2018 by Solus Project' +
    '\n\n•   <b>Gentoo Authors©</b> - 2001–2020 Gentoo is a trademark of the Gentoo Foundation, Inc.' +
    '\n\n•   <b>Voyager© Linux</b> - name and logo' +
    '\n\n•   <b>MX Linux©</b> - 2020 - Linux - is the registered trademark of Linus Torvalds ' +
                'in the U.S. and other countries.' +
    '\n\n•   <b>Red Hat, Inc.©</b> - Copyright 2020 name and logo' +
    '\n\n•   <b>Pardus</b> - name and logo are copyright © 2003-2023 by TUBITAK ULAKBIM' +
    '\n\n•   <b>ZORIN OS</b> - The "Z" logomark is a registered trademark of Zorin Technology Group Ltd. ' +
                'Copyright © 2019 - 2021 Zorin Technology Group Ltd';

var DEVELOPERS = '<b><a href="https://gitlab.com/AndrewZaech">AndrewZaech</a></b> - Current ArcMenu Maintainer and Developer' +
                '\n\n<b><a href="https://gitlab.com/LinxGem33">AndyC</a></b> - ArcMenu Founder, Former Maintainer, Digital Art Designer';
var CONTRIBUTORS = '<b>Thank you to all contributors and translators</b>\n\n' +
                    '<b><a href="https://gitlab.com/arcmenu/ArcMenu#contributors">Contributors</a></b> - ' +
                    '<b><a href="https://gitlab.com/arcmenu/ArcMenu#translators">Translators</a></b>';
var ARTWORK = '<b>Digital Artwork</b>\n\n' +
                '<b><a href="https://gitlab.com/LinxGem33">AndyC</a></b> - Custom icons and other ArcMenu Assets' +
                '\n\n<b><a href="https://gitlab.com/AndrewZaech">AndrewZaech</a></b> - Modification of some custom icons';

var GNU_SOFTWARE = '<span size="small">' +
    'This program comes with absolutely no warranty.\n' +
    'See the <a href="https://gnu.org/licenses/old-licenses/gpl-2.0.html">' +
    'GNU General Public License, version 2 or later</a> for details.' +
    '</span>';
