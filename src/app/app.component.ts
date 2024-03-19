// Remove all unused imports 
import {Component, Injectable, Input, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common"; 
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

// Create separate folder for services and move this service there, also cover with unit tests this service
@Injectable()
class MessageService {
  messages: Message[] = [];

  // Use dependency injection for HttpClient instead of using fetch
  async all() { // Add a method return type
      const res = await fetch('http://127.0.0.1:4010/messages')
      const data = await res.json();

      this.messages = data.messages.map((message: any) => new Message(message.text, message.status));
  }

  async add(message: Message) { // Add a method return type
    this.messages.push(message);
  }
}

class Message { // Create new folders 'models' and move this to separate file 'message.model.ts' 
  text;
  status: string;
  constructor(message: string, status: string) {
    this.text = message;
    this.status = status;
  }

  empty() { 
    return this.text === ''; // Remove return 
  }
}

// Generate new angular MessageComponent component and cover all components with unit tests
@Component({
  selector: 'app-massage', // typo in selector - app-massage -> app-message
  standalone: true, // Use @NgModule to define and import all modules, remove this
  template: `
    <div style="background-color: #fff;">
    <!-- Remove text-slate-500 class since we are using in below in ngClass to add/remove it depending on message status  -->
      <span class="bg-slate-400" class="block bg-slate-200 text-slate-500">#{{no}} - {{ message.status }}</span>
      <div class="p-2" [ngClass]="{'text-slate-500': message.status === 'draft'}">
        {{message.text}}
      </div>
    </div>
  `,
  imports: [
    NgClass
  ]
})
class MessageComponent {
  @Input({ required: true }) message: any; // Don't use any type
  @Input() no: any; // Use more descriptive names for class properties, also don't use any type
}

// Since there is no additional logic for chat component, only injecting MessageService to get an array of messages, 
// should remove this component and inject MessageService into MessageComponent, remove Input() props there, and work with message array there
@Component({
  selector: 'app-chat',
  standalone: true, // Use @NgModule to define and import all modules, remove this
  providers: [MessageService], // Since we don't need own instance of MessageService for every instance of this component, 
  // remove this after changing injectable property in service ('in root') 
  imports: [
    NgForOf, // Remove unused imports 
    MessageComponent
  ],
  template: `
    <div>
      <div *ngFor="let message of messages; index as i;">
        <app-massage [message]="message" [no]="i"></app-massage>
      </div>
    </div>
  `,
})
class ChatComponent implements OnInit {
  messages: Message[] = [];
    constructor(
        private messageService: MessageService
    ) {

    }

    async ngOnInit() {
      // Remove ts-ignore annotations below
      // @ts-ignore

      // Should refactor this method after changing MessageService to work with HttpClient and observables from RxJs
      await this.messageService.all();
      // It is a bad practice to access properties of service directly from other components (should be set to private).
      // Also, to remain single source of truth principle, create a method to get messages
      this.messages = this.messageService.messages; 
    }
}

// Generate new angular CreateMessageComponent component
@Component({
  selector: 'app-create-message',
  standalone: true, // Use @NgModule to define and import all modules, remove this
  providers: [MessageService], // Since we don't need own instance of MessageService (Doing only http request) 
  // for every instance of this component, remove this after changing injectable property in service ('in root')
  imports: [
    // Remove unused imports 
    ReactiveFormsModule,
    FormsModule,
    MessageComponent,
    NgIf,
    NgClass,
  ],
  template: `
  <!-- Remove blank space before message.empty() -->
    <div *ngIf="! message.empty()"> 
      <app-massage [message]="message" no="preview"></app-massage>
    </div>
    <form (ngSubmit)="onSubmit()">
      <label class="mt-4">
        <div>Write Message</div>
        <textarea class="block w-full" required name="text" [(ngModel)]="message.text"></textarea>
      </label>

      <button type="submit"
          [disabled]="message.status === 'pending'"
          class="pointer bg-blue-400 py-2 px-4 mt-2 w-full"
          [ngClass]="{'bg-gray-400': message.status === 'pending'}"
      >Send</button>
    </form>
  `,
  styles: ``
})
class CreateMessageComponent {
  message: Message = new Message('', 'draft');
  private messageService: MessageService; // Remove this

  constructor(messageService: MessageService) { // Add private access modifier and inject MessageService directly into constructor
    this.messageService = messageService; // Remove this
  }

  // Should refactor this method after changing MessageService to work with HttpClient and observables from RxJs
  async onSubmit() { // Add a method return type
      this.message.status = 'pending';
      const res = await fetch('http://127.0.0.1:4010/messages/send', {
        method: 'GET', // Cannot send body in request for GET http methods
        body: JSON.stringify({text: this.message.text}),
      });
      res.status === 204 ? this.message.status = 'sent' : this.message.status = 'failed';
      await this.messageService.add(this.message);
      this.message = new Message('', 'draft');
  }
}

// Generate new angular MessageComponent component
@Component({
  selector: 'app-root',
  standalone: true, // Use @NgModule to define and import all modules, remove this
  imports: [
      ChatComponent,
      CreateMessageComponent
  ],
  template: `
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl my-8">{{ title }}</h1>
      <app-chat></app-chat>
      <app-create-message></app-create-message>
    </div>
  `,
})
export class AppComponent {
  title = 'Chat';
}
