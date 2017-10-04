import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Insomnia } from '@ionic-native/insomnia';

import { AppComponent } from './app.component'
import { IntervalDisplayPage, IntervalSettingsPage } from '../pages/pages';
import { FabContainerComponent } from './components/fabcontainer.component/fabcontainer.component';
import { Storage } from './core/Storage';
import { NativeStorage } from '@ionic-native/native-storage';


@NgModule({
  declarations: [
    AppComponent,
    IntervalDisplayPage,
    IntervalSettingsPage,
    FabContainerComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(AppComponent)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AppComponent,
    IntervalDisplayPage,
    IntervalSettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ScreenOrientation,
    NativeStorage,
    Storage,
    Insomnia,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
