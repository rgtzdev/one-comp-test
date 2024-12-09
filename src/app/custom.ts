import {
  Component,
  computed,
  ElementRef,
  OnDestroy,
  signal,
  ViewChild,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import {
  combineLatest,
  filter,
  interval,
  Subscription,
  switchMap,
  tap,
} from "rxjs";

@Component({
  standalone: true,
  selector: "app-something-interesting",
  template: ` <div class="game-wrapper" (click)="clickWrapper($event)">
    <div class="header">
      <h2 class="notSoSmallTitle">Catch monkey, catch monkey woo-oh-oh</h2>
      <h2 class="smallerTitle">Catch monkey</h2>
      <span class="divider"></span>
      <button class="btn" (click)="startGame($event)">Start</button>
      <button class="btn" (click)="faster($event)">Faster?</button>
      <div class="lifes">
        @for (heart of hearts(); track $index) {
          <span>❤️</span>
        }
      </div>
    </div>
    <div class="yoParent" #yoParent (click)="clickYoParent($event)">
      @if (gameover()) {
        <div class="gameover">
          <span>TOO SLOW 😈</span>
          <button class="btn" (click)="startOver($event)">Start over?</button>
        </div>
      } @else if (catched()) {
        <div class="gameover">
          <span>WOW YOU ARE A PRO! 🫡</span>
          <button class="btn" (click)="startOver($event)">Start over?</button>
        </div>
      } @else {
        <span class="monkey" (click)="catchMonkey($event)">{{ monkey }}</span>
      }
    </div>
    <span class="speed"
      ><small>Speed: {{ speed() }}ms</small></span
    >
  </div>`,
  styles: [
    `
      .divider {
        flex: 1 1 auto;
      }
      .gameover {
        display: flex;
        flex-direction: column;
      }
      .game-wrapper {
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
      }
      .header {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 50px;
        padding-inline: 25px;
        gap: 10px;
      }
      .lifes {
        display: flex;
      }
      .yoParent {
        width: 50vw;
        height: calc(50vh - 50px);
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }
      .monkey {
        font-size: 4rem;

        cursor: pointer;
      }
      .btn {
        font-size: 22px;
        border: none;
        background-color: #3cffd0;
        padding: 8px 12px;
        cursor: pointer;
      }
      .smallerTitle {
        @media (min-width: 961px) {
          display: none;
        }
      }
      .notSoSmallTitle {
        @media (max-width: 961px) {
          display: none;
        }
      }
      .speed {
        position: absolute;
        bottom: 0;
      }
    `,
  ],
})
export class SomethingInterestingComponent implements OnDestroy {
  @ViewChild("yoParent")
  public yoParent!: ElementRef;

  public start = signal(false);
  public speed = signal(1000);
  public lifes = signal(3);
  public catched = signal(false);
  public hearts = computed(() => Array.from({ length: this.lifes() }));
  public gameover = computed(() => this.lifes() <= 0);
  public canLowerLifes = computed(
    () => !this.gameover() && this.start() && !this.catched(),
  );
  public canCatch = computed(
    () => this.start() && !this.gameover() && !this.catched(),
  );

  private monkeys = ["🙈", "🙉", "🙊", "🐵", "🐒"];
  private monkeyIndex = 0;
  public monkey = this.monkeys[this.monkeyIndex];

  private timer$ = combineLatest({
    start: toObservable(this.start),
    speed: toObservable(this.speed),
  }).pipe(
    switchMap(({ speed, start }) => {
      return interval(speed).pipe(
        filter(() => start),
        tap(() => {
          if (this.monkeyIndex === this.monkeys.length - 1) {
            this.monkeyIndex = 0;
          } else {
            this.monkeyIndex++;
          }
          this.monkey = this.monkeys[this.monkeyIndex];
        }),
        tap(() => {
          if (this.yoParent?.nativeElement) {
            this.yoParent.nativeElement.style.width = `${this.secureRandom()}vw`;
            this.yoParent.nativeElement.style.height = `calc(${this.secureRandom()}vh - 50px)`;
          }
        }),
      );
    }),
  );

  private subscription!: Subscription;

  constructor() {
    this.doSomethingInteresting();
  }

  private doSomethingInteresting() {
    this.subscription = this.timer$.subscribe();
  }

  catchMonkey(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.canCatch()) {
      this.catched.set(true);
      this.stop();
    }
  }

  startGame(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.start.set(true);
  }

  stop() {
    this.start.set(false);
  }

  faster(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.speed.update((speed) => {
      if (speed > 100) {
        return speed - 100;
      } else if (speed > 10) {
        return speed - 10;
      }
      return speed;
    });
  }

  secureRandom() {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomNumber = randomBuffer[0] / (0xffffffff + 1);
    return Math.floor(randomNumber * 100) + 10;
  }

  clickYoParent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.canLowerLifes()) {
      this.lifes.update((lifes) => lifes - 1);
      this.lostValidation();
    }
  }

  clickWrapper(event: Event) {
    event.preventDefault();
    if (this.canLowerLifes()) {
      this.lifes.update((lifes) => lifes - 1);
      this.lostValidation();
    }
  }

  reset() {
    this.yoParent.nativeElement.style.width = `50vw`;
    this.yoParent.nativeElement.style.height = `calc(50vh - 50px)`;
  }

  lostValidation() {
    if (this.gameover()) {
      this.reset();
      this.stop();
    }
  }

  startOver(event: Event) {
    this.lifes.set(3);
    this.catched.set(false);
    this.reset();
    this.startGame(event);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
