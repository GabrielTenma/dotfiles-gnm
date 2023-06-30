<p align="left">
  <h1>.dotfiles-gnm 💫</h1>
</p>

<br>

## Introduction
Dotfiles are used to customize your system. The “dotfiles” name is derived from the configuration files in Unix-like systems that start with a dot (e.g. .bash_profile and .gitconfig). For normal users, this indicates these are not regular documents, and by default are hidden in directory listings. For power users, however, they are a core tool belt.</tspan>!

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
