import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NotfoundComponent } from './modules/notfound/notfound.component';
import { NhungChatbotComponent } from './modules/nhung-chatbot/nhung-chatbot.component';

const routes: Routes = [
  {
    path: 'chatbot/:id', component: NhungChatbotComponent,
  },
  { path: 'pages/notfound', component: NotfoundComponent },
  { path: '**', redirectTo: 'chatbot/:id' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
