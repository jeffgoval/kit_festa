import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ManagerHeader } from './ManagerHeader'

export function ManagerRoot() {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ManagerHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
