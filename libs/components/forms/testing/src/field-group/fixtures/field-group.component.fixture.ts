import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  SkyFieldGroupHeadingLevel,
  SkyFieldGroupHeadingStyle,
  SkyFieldGroupModule,
  SkyInputBoxModule,
} from '@skyux/forms';

@Component({
  standalone: true,
  selector: 'sky-field-group-fixture',
  templateUrl: './field-group.component.fixture.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SkyFieldGroupModule,
    SkyInputBoxModule,
  ],
})
export class FieldGroupComponent {
  protected formGroup: FormGroup;
  public stacked = false;
  public labelText = 'Label text';
  public labelHidden = false;
  public headingLevel: SkyFieldGroupHeadingLevel = 3;
  public headingStyle: SkyFieldGroupHeadingStyle = 3;

  constructor() {
    this.formGroup = inject(FormBuilder).group({
      name: new FormControl(),
    });
  }
}