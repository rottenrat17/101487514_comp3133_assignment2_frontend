import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';

// Small hover lift on cards and panels.
@Directive({
  selector: '[appHoverElevate]',
  standalone: true,
})
export class HoverElevateDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly r = inject(Renderer2);

  @HostListener('mouseenter')
  onEnter(): void {
    this.r.setStyle(this.el.nativeElement, 'transform', 'translateY(-2px)');
    this.r.setStyle(this.el.nativeElement, 'box-shadow', '0 8px 24px rgba(0,0,0,.12)');
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.r.removeStyle(this.el.nativeElement, 'transform');
    this.r.removeStyle(this.el.nativeElement, 'box-shadow');
  }
}
