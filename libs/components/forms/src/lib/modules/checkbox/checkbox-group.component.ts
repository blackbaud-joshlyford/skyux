import { CommonModule } from '@angular/common';
import {
  Component,
  HostBinding,
  Input,
  TemplateRef,
  booleanAttribute,
  inject,
  numberAttribute,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SkyIdModule, SkyIdService } from '@skyux/core';
import { SkyHelpInlineModule } from '@skyux/help-inline';

import { SKY_FORM_ERRORS_ENABLED } from '../form-error/form-errors-enabled-token';
import { SkyFormErrorsModule } from '../form-error/form-errors.module';
import { SkyFormsResourcesModule } from '../shared/sky-forms-resources.module';

import { SkyCheckboxGroupHeadingLevel } from './checkbox-group-heading-level';
import { SkyCheckboxGroupHeadingStyle } from './checkbox-group-heading-style';

/**
 * Organizes checkboxes into a group.
 */
@Component({
  selector: 'sky-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    SkyFormErrorsModule,
    SkyFormsResourcesModule,
    SkyHelpInlineModule,
    SkyIdModule,
  ],
  providers: [{ provide: SKY_FORM_ERRORS_ENABLED, useValue: true }],
})
export class SkyCheckboxGroupComponent {
  /**
   * The content of the help popover. When specified, a [help inline](https://developer.blackbaud.com/skyux/components/help-inline)
   * button is added to the checkbox group fieldset legend. The help inline button displays a [popover](https://developer.blackbaud.com/skyux/components/popover)
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
   * The text to display as the checkbox group's heading.
   * @preview
   */
  @Input({ required: true })
  public headingText!: string;

  /**
   * Indicates whether to hide the `headingText`.
   * @preview
   */
  @Input({ transform: booleanAttribute })
  public headingHidden = false;

  /**
   * The semantic heading level in the document structure.
   * @preview
   * @default 3
   */
  @Input({ transform: numberAttribute })
  public headingLevel: SkyCheckboxGroupHeadingLevel = 3;

  /**
   * The heading [font style](https://developer.blackbaud.com/skyux/design/styles/typography#headings).
   * @preview
   * @default 3
   */
  @Input({ transform: numberAttribute })
  public set headingStyle(value: SkyCheckboxGroupHeadingStyle) {
    this.headingClass = `sky-font-heading-${value}`;
  }

  /**
   * [Persistent inline help text](https://developer.blackbaud.com/skyux/design/guidelines/user-assistance#inline-help) that provides
   * additional context to the user.
   * @preview
   */
  @Input()
  public hintText: string | undefined;

  /**
   * Whether the checkbox group is required.
   * @preview
   */
  @Input({ transform: booleanAttribute })
  public required = false;

  /**
   * Whether the checkbox group is stacked on another form component. When specified, the appropriate
   * vertical spacing is automatically added to the checkbox group.
   * @preview
   */
  @Input({ transform: booleanAttribute })
  @HostBinding('class.sky-margin-stacked-lg')
  public stacked = false;

  /**
   * The form group that contains the group of checkboxes.
   * @preview
   */
  @Input({ required: true })
  public formGroup!: FormGroup;

  /**
   * A help key that identifies the global help content to display. When specified, a [help inline](https://developer.blackbaud.com/skyux/components/help-inline) button is
   * placed beside the checkbox group heading. Clicking the button invokes global help as configured by the application.
   * @preview
   */
  @Input()
  public helpKey: string | undefined;

  readonly #idSvc = inject(SkyIdService);
  protected errorId = this.#idSvc.generateId();
  protected formErrorsDataId = 'checkbox-group-form-errors';
  protected headingClass = 'sky-font-heading-3';
}
