import { Routes } from "@angular/router";
// import { LoginComponent } from 'src/app/components/login/login.component';
// import { RegisterComponent } from 'src/app/components/register/register.component';
// import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';
// import { SettingsComponent } from 'src/app/components/settings/settings.component';

export const userRoutes: Routes = [
  {
    path: "user",
    children: [
      //   {
      //     path: "",
      //     redirectTo: "login",
      //     pathMatch: "full"
      //   },
      //   {
      //     path: "login",
      //     component: LoginComponent
      //   },
      //   {
      //     path: "register",
      //     component: RegisterComponent
      //   },
      //   {
      //     path: "dashboard",
      //     component: DashboardComponent
      //   },
      //   {
      //     path: "settings",
      //     component: SettingsComponent
      //   }
    ]
  },

  { path: "", redirectTo: "", pathMatch: "full" }
];
