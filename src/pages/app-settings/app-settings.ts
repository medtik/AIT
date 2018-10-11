/**
    AiT - Another Interval Timer
    Copyright (C) 2018 Marc Kassay

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { Component, ViewChild } from '@angular/core';
import { IonicPage, MenuController, NavController, NavParams } from 'ionic-angular';
import { AppStorageData, BrightnessSet } from '../../providers/storage/ait-storage.interfaces';
import { AITStorage } from '../../providers/storage/ait-storage.service';
import { AITBrightness, BrightnessUtil } from '../../providers/ait-screen';
import { AccentTheme, BaseTheme, ThemeSettingsProvider } from '../../providers/theme-settings.provider';
import { Navbar } from 'ionic-angular/navigation/nav-interfaces';
import { AITSignal } from '../../providers/ait-signal';

@IonicPage()
@Component({
  selector: 'page-app-settings',
  templateUrl: 'app-settings.html',
})
export class AppSettingsPage {
  _data: AppStorageData;
  get data(): AppStorageData {
    return this._data;
  }
  set data(value: AppStorageData) {
    this._data = value;
  }

  @ViewChild('Navbar')
  nav: Navbar;

  BaseTheme = BaseTheme;
  AccentTheme = AccentTheme;

  absoluteBrightnessValue: BrightnessSet;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public storage: AITStorage,
    public brightness: AITBrightness,
    public signal: AITSignal,
    public settings: ThemeSettingsProvider,
    public menuCtrl: MenuController) {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false, 'left');
    this.menuCtrl.enable(false, 'right');

    this.storage.getItem(AITStorage.APP_ID).then((value) => {
      this.data = value as AppStorageData;
      this.absoluteBrightnessValue = BrightnessUtil.absolute(this.data.brightness);
    }).catch((reason: any) => {
      console.log("app-settings storage error" + reason);
    });
  }

  ionViewWillLeave() {
    if (this.data) {
      this.storage.setItem(this.data);
      this.signal.data = this.data;
    }
  }

  testVolume(event?: MouseEvent) {
    this.signal.double();
  }

  toggleRememberSound() {
    // TODO: start adding sound code
    // this.data.sound = ;
  }

  toggleRememberBrightness() {
    this.data.brightness = BrightnessUtil.reverseSign(this.data.brightness);
  }

  brightnessChanged(event: any): void {
    this.data.brightness = (event.value as BrightnessSet);
  }

  toggleBaseTheme(value: BaseTheme) {
    this.settings.base = value;
    this._data.base = value;
  }

  toggleAccentTheme(value: AccentTheme) {
    this.settings.accent = value;
    this._data.accent = value;
  }

  navBack() {
    this.navCtrl.pop();
  }
}
