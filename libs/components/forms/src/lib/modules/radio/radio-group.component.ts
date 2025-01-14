import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  Self,
  TemplateRef,
  booleanAttribute,
  inject,
  numberAttribute,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { SkyFormsUtility, SkyIdService, SkyLogService } from '@skyux/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SKY_FORM_ERRORS_ENABLED } from '../form-error/form-errors-enabled-token';
import { SkyFormFieldLabelTextRequiredService } from '../shared/form-field-label-text-required.service';

import { SkyRadioGroupIdService } from './radio-group-id.service';
import { SkyRadioComponent } from './radio.component';
import { SkyRadioChange } from './types/radio-change';
import { SkyRadioGroupHeadingLevel } from './types/radio-group-heading-level';
import { SkyRadioGroupHeadingStyle } from './types/radio-group-heading-style';

let nextUniqueId = 0;

/**
 * Organizes radio buttons into a group. It is required for radio
 * buttons on Angular reactive forms, and we recommend using it with all radio buttons.
 * On Angular forms, the component manages the selected values and keeps the forms up-to-date.
 * When users select a radio button, its value is driven through an `ngModel` attribute that you specify on the `sky-radio-group` element.
 */
@Component({
  selector: 'sky-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss'],
  providers: [
    SkyRadioGroupIdService,
    { provide: SKY_FORM_ERRORS_ENABLED, useValue: true },
  ],
})
export class SkyRadioGroupComponent
  implements AfterContentInit, AfterViewInit, OnInit, OnDestroy
{
  /**
   * The HTML element ID of the element that labels
   * the radio button group. This sets the radio button group's `aria-labelledby` attribute to provide a text equivalent for screen readers
   * [to support accessibility](https://developer.blackbaud.com/skyux/learn/accessibility).
   * If the radio button group does not include a visible label, use `ariaLabel` instead.
   * For more information about the `aria-labelledby` attribute, see the [WAI-ARIA definition](https://www.w3.org/TR/wai-aria/#aria-labelledby).
   * @deprecated Use `headingText` instead.
   */
  @Input()
  public set ariaLabelledBy(value: string | undefined) {
    this.#_ariaLabelledBy = value;

    if (value) {
      this.#logger.deprecated('SkyRadioGroupComponent.ariaLabelledBy', {
        deprecationMajorVersion: 9,
      });
    }
  }

  public get ariaLabelledBy(): string | undefined {
    return this.#_ariaLabelledBy;
  }

  /**
   * The ARIA label for the radio button group. This sets the
   * radio button group's `aria-label` attribute to provide a text equivalent for screen readers
   * [to support accessibility](https://developer.blackbaud.com/skyux/learn/accessibility).
   * If the radio button group includes a visible label, use `ariaLabelledBy` instead.
   * For more information about the `aria-label` attribute, see the [WAI-ARIA definition](https://www.w3.org/TR/wai-aria/#aria-label).
   * @deprecated Use `headingText` instead.
   */
  @Input()
  public set ariaLabel(value: string | undefined) {
    this.#_ariaLabel = value;

    if (value) {
      this.#logger.deprecated('SkyRadioGroupComponent.ariaLabel', {
        deprecationMajorVersion: 9,
      });
    }
  }

  public get ariaLabel(): string | undefined {
    return this.#_ariaLabel;
  }

  /**
   * Whether to disable the input on template-driven forms. Don't use this input on reactive forms because they may overwrite the input or leave the control out of sync.
   * To set the disabled state on reactive forms, use the `FormControl` instead.
   * @default false
   */
  @Input()
  public set disabled(value: boolean | undefined) {
    const newDisabledState = SkyFormsUtility.coerceBooleanProperty(value);
    if (this.#_disabled !== newDisabledState) {
      this.#_disabled = newDisabledState;
      this.#updateRadioButtonDisabled();
    }
  }

  public get disabled(): boolean {
    return this.#_disabled;
  }

  /**
   * The semantic heading level in the document structure.
   * @preview
   * @default 3
   */
  @Input({ transform: numberAttribute })
  public headingLevel: SkyRadioGroupHeadingLevel = 3;

  /**
   * The heading [font style](https://developer.blackbaud.com/skyux/design/styles/typography#headings).
   * @preview
   * @default 3
   */
  @Input({ transform: numberAttribute })
  public set headingStyle(value: SkyRadioGroupHeadingStyle) {
    this.headingClass = `sky-font-heading-${value}`;
  }

  /**
   * The name for the collection of radio buttons that the component groups together.
   * This property overwrites the deprecated `name` property on individual `sky-radio` elements,
   * and it is required unless the `name` property is set on individual `sky-radio` elements.
   * @required
   */
  @Input()
  public set name(value: string | undefined) {
    if (value) {
      this.#_name = value;
    } else {
      this.#_name = this.#defaultName;
    }
    this.#updateRadioButtonNames();
  }
  public get name(): string {
    return this.#_name;
  }

  /**
   * Whether the input is required for form validation.
   * When you set this property to `true`, the component adds `aria-required` and `required`
   * attributes to the input element so that forms display an invalid state until the input element
   * is complete.
   * For more information about the `aria-required` attribute, see the [WAI-ARIA definition](https://www.w3.org/TR/wai-aria/#aria-required).
   * @default false
   */
  @Input()
  public required: boolean | undefined = false;

  /**
   * Whether the radio button group is stacked on another form component. When specified,
   * the appropriate vertical spacing is automatically added to the radio button group.
   * @preview
   */
  @Input({ transform: booleanAttribute })
  @HostBinding('class.sky-margin-stacked-lg')
  public stacked = false;

  /**
   * The value of the radio button to select by default when the group loads.
   * The value corresponds to the `value` property of an individual `sky-radio` element within the
   * group.
   */
  // TODO: Look into more strongly typing in a breaking change
  @Input()
  public set value(value: any) {
    const isNewValue = value !== this.#controlValue;

    /* istanbul ignore else */
    if (isNewValue) {
      this.#controlValue = value;
      this.#onChange(value);
      this.#updateCheckedRadioFromValue();
    }
  }

  /**
   * The index for all the radio buttons in the group. If the index is not defined,
   * the indices for individual radio buttons are set to their positions on load.
   * This property supports accessibility by placing focus on the currently selected radio
   * button. If no radio button is selected, it places focus on the first or last button
   * depending on how users navigate to the radio button group.
   */
  @Input()
  public set tabIndex(value: number | undefined) {
    if (this.#_tabIndex !== value) {
      this.#_tabIndex = value;
      this.#updateRadioButtonTabIndexes();
    }
  }
  public get tabIndex(): number | undefined {
    return this.#_tabIndex;
  }

  /**
   * The text to display as the radio group's heading.
   * @preview
   */
  @Input()
  public headingText: string | undefined;

  /**
   * Indicates whether to hide the `headingText`.
   * @preview
   */
  @Input({ transform: booleanAttribute })
  public headingHidden = false;

  @HostBinding('style.display')
  public display: string | undefined;

  /**
   * [Persistent inline help text](https://developer.blackbaud.com/skyux/design/guidelines/user-assistance#inline-help) that provides
   * additional context to the user.
   * @preview
   */
  @Input()
  public hintText: string | undefined;

  /**
   * The content of the help popover. When specified along with `headingText`, a [help inline](https://developer.blackbaud.com/skyux/components/help-inline)
   * button is added to radio group. The help inline button displays a [popover](https://developer.blackbaud.com/skyux/components/popover)
   * when clicked using the specified content and optional title.
   * @preview
   */
  @Input()
  public helpPopoverContent: string | TemplateRef<unknown> | undefined;

  /**
   * The title of the help popover. This property only applies when `helpPopoverContent` is
   * also specified.
   * @preview
   */
  @Input()
  public helpPopoverTitle: string | undefined;

  /**
   * A help key that identifies the global help content to display. When specified, a [help inline](https://developer.blackbaud.com/skyux/components/help-inline) button is
   * placed beside the radio group heading. Clicking the button invokes global help as configured by the application.
   * @preview
   */
  @Input()
  public helpKey: string | undefined;

  /**
   * Our radio components are usually implemented using an unordered list. This is an
   * accessibility violation because the unordered list has an implicit role which
   * interrupts the 'radiogroup' and 'radio' relationship. To correct this, we can set the
   * radio group's 'aria-owns' attribute to a space-separated list of radio IDs.
   * For more information about the `aria-owns` attribute, see the [WAI-ARIA definition](https://www.w3.org/TR/wai-aria/#aria-owns), and for more information about the `radio` role, see [its definition](https://www.w3.org/TR/wai-aria/#radio).
   */
  public ariaOwns: string | undefined;

  @ContentChildren(SkyRadioComponent, { descendants: true })
  public radios: QueryList<SkyRadioComponent> | undefined;

  #controlValue: any;

  #defaultName = `sky-radio-group-${nextUniqueId++}`;

  #ngUnsubscribe = new Subject<void>();

  #_disabled = false;

  #_name = '';

  #_tabIndex: number | undefined;

  #_ariaLabel: string | undefined;

  #_ariaLabelledBy: string | undefined;

  #changeDetector: ChangeDetectorRef;
  #radioGroupIdSvc: SkyRadioGroupIdService;

  readonly #logger = inject(SkyLogService);
  readonly #idService = inject(SkyIdService);

  readonly #headingTextRequired = inject(SkyFormFieldLabelTextRequiredService, {
    optional: true,
  });

  protected errorId = this.#idService.generateId();
  protected ngControl: NgControl | undefined;
  protected headingClass = 'sky-font-heading-3';

  constructor(
    changeDetector: ChangeDetectorRef,
    radioGroupIdSvc: SkyRadioGroupIdService,
    @Self() @Optional() ngControl: NgControl,
  ) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
    this.#changeDetector = changeDetector;
    this.#radioGroupIdSvc = radioGroupIdSvc;
    this.ngControl = ngControl;
    this.name = this.#defaultName;

    this.#radioGroupIdSvc.radioIds
      .pipe(takeUntil(this.#ngUnsubscribe))
      .subscribe((ids) => {
        this.ariaOwns = ids.join(' ') || undefined;
        this.#changeDetector.markForCheck();
      });
  }

  public ngAfterContentInit(): void {
    // Let child radio components render before updating.
    setTimeout(() => {
      this.#resetRadioButtons();
    });

    // Watch for radio selections.
    this.watchForSelections();

    /* istanbul ignore else */
    if (this.radios) {
      this.radios.changes.pipe(takeUntil(this.#ngUnsubscribe)).subscribe(() => {
        // Wait for child radio components to finish any rendering updates.
        setTimeout(() => {
          this.#resetRadioButtons();
        });

        // Subscribe to the new radio buttons
        this.watchForSelections();
      });
    }
  }

  public ngAfterViewInit(): void {
    if (this.ngControl) {
      this.required =
        this.required || SkyFormsUtility.hasRequiredValidation(this.ngControl);

      // Avoid an ExpressionChangedAfterItHasBeenCheckedError.
      this.#changeDetector.detectChanges();
    }
  }

  public watchForSelections(): void {
    /* istanbul ignore else */
    if (this.radios) {
      this.radios.forEach((radio) => {
        radio.change
          .pipe(takeUntil(this.#ngUnsubscribe))
          .subscribe((change: SkyRadioChange) => {
            this.#onTouched();
            this.value = change.value;
          });
        radio.blur.pipe(takeUntil(this.#ngUnsubscribe)).subscribe(() => {
          this.#onTouched();
          this.#changeDetector.markForCheck();
        });
      });
    }
  }

  public ngOnInit(): void {
    if (this.#headingTextRequired && !this.headingText) {
      this.display = 'none';
    }
    this.#headingTextRequired?.validateLabelText(this.headingText);
  }

  public ngOnDestroy(): void {
    this.#ngUnsubscribe.next();
    this.#ngUnsubscribe.complete();
  }

  public writeValue(value: unknown): void {
    const isNewValue = value !== this.#controlValue;

    /* istanbul ignore else */
    if (isNewValue) {
      this.#controlValue = value;
      this.#updateCheckedRadioFromValue();
    }
  }

  /**
   * @internal
   * Whether to disable the control. Implemented as a part of ControlValueAccessor.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public registerOnChange(fn: (value: any) => void): void {
    this.#onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.#onTouched = fn;
  }

  /* istanbul ignore next */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  #onChange: (value: any) => void = () => {};

  /* istanbul ignore next */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  #onTouched: () => any = () => {};

  #updateRadioButtonDisabled(): void {
    if (this.radios) {
      this.radios.forEach((radio) =>
        radio.setGroupDisabledState(this.disabled),
      );
    }
  }

  #updateRadioButtonNames(): void {
    if (this.radios) {
      this.radios.forEach((radio) => {
        radio.name = this.name;
      });
    }
  }

  #updateRadioButtonTabIndexes(): void {
    if (this.radios) {
      this.radios.forEach((radio) => {
        radio.groupTabIndex = this.tabIndex;
      });
    }
  }

  #updateCheckedRadioFromValue(): void {
    if (!this.radios) {
      return;
    }

    this.radios.forEach((radio) => {
      radio.checked = this.#controlValue === radio.value;
    });
  }

  #resetRadioButtons(): void {
    this.#updateCheckedRadioFromValue();
    this.#updateRadioButtonNames();
    this.#updateRadioButtonTabIndexes();
    this.#updateRadioButtonDisabled();
  }
}
