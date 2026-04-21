import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DealsDay } from '../../components/deals-day/deals-day';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, DealsDay],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {}
