<p align="left">
  <h1>.dotfiles-gnm ✨</h1>
</p>

<br>

## Installation
This is my personal collection of configuration files and ofc you are probably here for my gnome configuration, the [setup section](#setup) will guide you through the installation process.

<br>

## Setup `(step I)`
Here are the instructions you should follow to replicate my setup.

1. Install git-version then enter
  ```shell
  git clone https://github.com/GabrielTenma/dotfiles-gnm.git
  cd dotfiles-gnm
  ```
2. Install theme, copy or enter command
  ```shell
  cp -r ./themes/* ~/.themes/
  cp -r ./icons/* ~/.icons/
  cp -r ./gnome-shell/* ~/.local/share/gnome-shell/*
  ```
3. Install gnome tweak tool `arch command`
  ```shell
  yay -S gnome-tweak-tool
  ```
4. Install all fonts
  ```shell
  sudo cp -r ./misc/fonts/* /usr/share/fonts/
  ```
5. Set all config in gnome tweak tool
   `search in menu`

<br>

## Configuration `(step II)`

make sure you have been installed <ins>**gnome shell integration**</ins>, here for chrome: https://chrome.google.com/webstore/detail/gnome-shell-integration/gphhapmejobijbbhgpjhcjognlahblep

then open: https://extensions.gnome.org/
to check installed extension, go here: https://extensions.gnome.org/local/

search those listed extension below, make sure mandatory extension should be installed:

## Mandatory to install `(step III)`
- ArcMenu :: https://extensions.gnome.org/extension/3628/arcmenu/ (left corner menu mod)
- Aylur's Widgets :: https://extensions.gnome.org/extension/5338/aylurs-widgets/ (add additional menu on top mod)
- Burn my windows :: https://extensions.gnome.org/extension/4679/burn-my-windows/ (window animation mod)
- Compiz alike magic lamp effect :: https://extensions.gnome.org/extension/3740/compiz-alike-magic-lamp-effect/ (fix glitch minimize gnome effect)
- Dash to dock :: https://extensions.gnome.org/extension/307/dash-to-dock/ (add dock)
- One window wonderland :: https://extensions.gnome.org/extension/5696/one-window-wonderland/ (window gaps when maximize)
- OpenWeather :: https://extensions.gnome.org/extension/750/openweather/ (weather indicator)
- Top bar organizer :: https://extensions.gnome.org/extension/4356/top-bar-organizer/ (organize top menu)
- Useless gaps :: https://extensions.gnome.org/extension/4684/useless-gaps/ (window gaps too)

## Optional to install `(step IV)`
- Caffeine :: https://extensions.gnome.org/extension/517/caffeine/ (pause screen timeout)
- AATWS - Advanced Alt-Tab Window Switcher :: https://extensions.gnome.org/extension/4412/advanced-alttab-window-switcher/ (alt tab mod)
- Text scaler :: https://extensions.gnome.org/extension/1018/text-scaler/ (font scaling + listed to top menu)

## Configure installed extension `(step V)`
`video preview` here how to configure those extension: **https://drive.google.com/file/d/1q0XwtoJShAm0K07BT9JiV5Xkzt6iaiFD/view?usp=sharing**

<br>

## Screenshot
<table cellpadding="4">
<tbody>
<tr>
<td>
<p align="center">
  <img src="https://github.com/GabrielTenma/dotfiles-gnm/blob/master/.assets/rounded-logo1.png?raw=true" align="center" alt="logo" width="190px">
</p>
<p>
  <table  cellpadding="4">
    <tbody>
        <tr>
            <td><b>Theme name</b></td>
            <td><a href="https://github.com/vinceliuice/Graphite-gtk-theme">graphite dark</a></td>
        </tr>
        <tr>
            <td><b>Icon pack</b></td>
            <td><a href="https://github.com/yeyushengfan258/Citrus-icon-theme">citrus</a></td>
        </tr>
        <tr>
            <td><b>Font installed</b></td>
            <td>product sans</td>
        </tr>
    </tbody>
  </table>
</p></td>
  <td>
<!--     <img src="https://raw.githubusercontent.com/GabrielTenma/dotfiles-gnm/theme-graphitedark/.assets/desktop-1.png" alt="img" width="600px"> -->
    <img src="https://raw.githubusercontent.com/GabrielTenma/dotfiles-gnm/theme-graphitedark/.assets/desktop-2.png" alt="img" width="600px">
  </td>
</tr>
</tbody>
</table>
