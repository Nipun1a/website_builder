import { useNavigate, NavLink } from "react-router-dom"

import { authClient } from "@/lib/auth-client"
import { AuthProvider } from "@/components/auth-provider"
import { deleteUserPlugin } from "@/lib/delete-user-plugin"

export function Providers({ children }: { children: React.ReactNode }) {
const navigate = useNavigate()

return (
<AuthProvider
  authClient={authClient}
  redirectTo="/"
  plugins={[deleteUserPlugin()]}
  navigate={navigate}
  Link={(props) => <NavLink {...props} to={props.href} />}
>
  {children}
</AuthProvider>
)
}

export default Providers
