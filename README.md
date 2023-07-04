<p align="left">
  <h1>.dotfiles-gnm 💫</h1>
</p>

<br>

## Introduction
This is my personal collection of configuration files, you are probably here for my gnome configuration, the [setup section](#setup) will guide you through the installation process.

<br>

## Setup
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

## Screenshot
<table cellpadding="4">
<tbody>
<tr>
<td>
  <table  cellpadding="4">
    <tbody>
      <tr>
        <td><b>Graphite dark</b></td>
      </tr>
      <tr>
        <td>better for daily use</td>
      </tr>
    </tbody>
  </table>
<P>
  <table  cellpadding="4">
    <tbody>
        <tr>
            <td><b>theme</b></td>
            <td>graphite</td>
        </tr>
        <tr>
            <td><b>icon</b></td>
            <td>citrus</td>
        </tr>
        <tr>
            <td><b>font</b></td>
            <td>product sans</td>
        </tr>
    </tbody>
  </table>
</P></td>
<td><img src="https://raw.githubusercontent.com/GabrielTenma/dotfiles-gnm/theme-graphitedark/.assets/desktop-graphite-dark.png" alt="img" width="600px"></td>
</tr>
</tbody>
</table>
