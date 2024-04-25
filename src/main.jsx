import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "primeicons/primeicons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "primereact/resources/themes/lara-light-green/theme.css"
import "primereact/resources/primereact.css"
import "./index.css"
import "react-toastify/dist/ReactToastify.css"
import "react-datepicker/dist/react-datepicker.css"
import "/node_modules/primeflex/primeflex.css"

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { AuthProvier } from "./context/AuthContext"

import { BrowserRouter } from "react-router-dom"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AppConfigurationProivder } from "./context/AppConfigurationContext.jsx"
import { UserRightsProivder } from "./context/UserRightContext.jsx"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvier>
          <UserRightsProivder>
            <AppConfigurationProivder>
              <App />
            </AppConfigurationProivder>
          </UserRightsProivder>
        </AuthProvier>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)
