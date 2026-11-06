import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from '@layout/bottom-nav/bottom-nav';
import { CartDrawer } from '@layout/cart-drawer/cart-drawer';
import { ChatSupport } from '@layout/chat-support/chat-support';
import { Footer } from '@layout/footer/footer';
import { Header } from '@layout/header/header';

/** Componente raíz: define el layout (shell) de la aplicación. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, BottomNav, ChatSupport, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
