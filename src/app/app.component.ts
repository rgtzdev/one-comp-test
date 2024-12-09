import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SomethingInterestingComponent } from "./custom";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, SomethingInterestingComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {}
