import { useNavigate, NavLink } from "react-router-dom"

import { authClient } from "@/lib/auth-client"
import { AuthProvider } from "@/components/auth-provider"

export function Providers({ children }: { children: React.ReactNode }) {
const navigate = useNavigate()

return (
<AuthProvider
  authClient={authClient}
  navigate={navigate}
  Link={(props) => <NavLink {...props} to={props.href} />}
>
  {children}
</AuthProvider>
)
}

export default Providers
