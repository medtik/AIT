/**
    AiT - Another Interval Timer
    Copyright (C) 2019 Marc Kassay

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
import { inject, AfterContentInit, AfterViewInit, ChangeDetectorRef, InjectionToken, Injector, OnInit } from '@angular/core';
import { MenuController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

import { SideMenuService, SideMenuStatusResponse } from '../components/side-menu/side-menu.service';
import { StorageDefaultData } from '../services/storage/ait-storage.defaultdata';
import { AITStorage } from '../services/storage/ait-storage.service';
import { AppStorageData, UUIDData } from '../services/storage/ait-storage.shapes';

import { DisplayPage } from './display-page';

export class SettingsPage implements OnInit, AfterContentInit, AfterViewInit {

  _uuid: string;
  get uuid(): string {
    return this._uuid;
  }
  set uuid(value: string) {
    this._uuid = value;
  }

  _injector: Injector;
  get injector(): Injector {
    return this._injector;
  }
  set injector(value: Injector) {
    this._injector = value;
  }

  private menuElement: HTMLIonMenuElement;
  private _appSubject: BehaviorSubject<AppStorageData>;
  private _pageSubject: BehaviorSubject<UUIDData>;

  // note that this object exists in the display-page instance too. so any changes here will be
  // reflect instantly in the display-page.
  protected _uuidData: UUIDData;

  // TODO: move inform logic to util
  protected showInform: boolean;
  protected appSoundsDisabled: boolean;
  protected appVibratorDisabled: boolean;
  protected grandTime: string;

  // TODO: not ideal place for these properties since used by a subclass. need to resolve
  // inhertience issue with missing injections.
  protected computedFactorValue = { lower: 10, upper: 100 };
  protected clonedForTenFactor: { [k: string]: any; } | undefined;
  protected clonedForOneFactor: { [k: string]: any; } | undefined;
  protected clonedForCountdownFactor: number | undefined;

  protected storage: AITStorage;
  protected menuCtrl: MenuController;
  protected toastCtrl: ToastController;
  protected menuSvc: SideMenuService<SideMenuStatusResponse>;
  //  protected changeRef: ChangeDetectorRef;

  constructor() { }
  ngOnInit(): void {
    // this injector is from the current display-page. this method of injection was followed by:
    // https://stackoverflow.com/a/48723478
    //  * var myInterface = injector.get(new InjectionToken<MyInterface>('SomeToken'));

    this.storage = this.injector.get<AITStorage>(AITStorage);
    this.menuCtrl = this.injector.get<MenuController>(MenuController);
    this.toastCtrl = this.injector.get<ToastController>(ToastController);
    this.menuSvc = this.injector.get<SideMenuService<SideMenuStatusResponse>>(SideMenuService);
    // this.changeRef = this.injector.get<ChangeDetectorRef>(ChangeDetectorRef);
  }

  ngAfterContentInit(): void {
    const getSubjects = async (): Promise<void> => {
      await this.storage.getPromiseSubject<AppStorageData>(StorageDefaultData.APP_ID)
        .then((value) => {
          this._appSubject = value;
        });

      await this.storage.getPromiseSubject(this.uuid)
        .then((value) => {
          this._pageSubject = value;
        });

      this.subscribe();
    };
    getSubjects();
  }

  ngAfterViewInit(): void {
    this.menuSvc.next({
      subject: 'end',
      uuid: this._uuid,
      response: true
    });
  }

  private subscribe(): void {
    this._appSubject.subscribe((value) => {
      this.appSoundsDisabled = value.sound === 0;
      this.appVibratorDisabled = value.vibrate === false;
      this.showInform = (this.appSoundsDisabled || this.appVibratorDisabled);
    });

    this._pageSubject.subscribe((value) => {
      this._uuidData = value;
      //  this.changeRef.detectChanges();
    });

    this.menuCtrl.get('end').then((element) => {
      this.menuElement = element;
      this.menuOpen();
    });
  }

  // TODO: this menu business should be moved into a service
  private menuOpen(): void {
    this.menuElement.removeEventListener('ionDidOpen', this.menuOpen);
    this.menuElement.addEventListener('ionDidClose', this.menuClosed);
  }

  // TODO: this menu business should be moved into a service
  private menuClosed(): void {
    this._pageSubject.next(this._uuidData);
    // TODO: when unsubscribing, throws undefined error. i think this has to do with the way
    // subpages are being injected.
    // this._pageSubject.unsubscribe();
    // this._appSubject.unsubscribe();
    this.menuElement.removeEventListener('ionDidClose', this.menuClosed);
    this.menuElement.addEventListener('ionDidOpen', this.menuOpen);
  }

  async inform(): Promise<void> {
    let bmesg = (this.appSoundsDisabled) ? 1 : 0;
    bmesg += (this.appVibratorDisabled) ? 2 : 0;
    bmesg += (bmesg === 3) ? 4 : 0;

    let smesg: string;
    if (bmesg === 1) {
      smesg = 'sound setting is disabled';
    } else if (bmesg === 2) {
      smesg = 'vibrate setting is disabled';
    } else {
      smesg = 'sound and vibrate settings are disabled';
    }

    const toast = await this.toastCtrl.create({
      message: 'AiT\'s ' + smesg + '. Go to \'AiT Settings\' page and adjust accordingly if needed.',
      duration: 10000,
      showCloseButton: true,
      position: 'top'
    });

    toast.present();
  }
}
