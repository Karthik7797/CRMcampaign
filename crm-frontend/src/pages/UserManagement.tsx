import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus, Search, Shield, MoreVertical,
  Edit2, KeyRound, UserX, X, Check, Users, Crown, Eye, EyeOff
} from 'lucide-react'
import { usersApi } from '../api/client'
import { ROLE_DISPLAY, getRoleColor, type Role } from '../lib/permissions'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  isActive: boolean
  createdAt: string
  _count?: { leads: number; tasks: number }
}

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR']

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (filterRole) params.role = filterRole
      const { data } = await usersApi.getAll(params)
      setUsers(data.users)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [search, filterRole])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.name}?`)) return
    try {
      await usersApi.deactivate(user.id)
      toast.success(`${user.name} has been deactivated`)
      fetchUsers()
    } catch {
      toast.error('Failed to deactivate user')
    }
    setMenuOpen(null)
  }

  // Count by role
  const roleCounts = ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Users size={22} /> User Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage team members and their roles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 h-10"
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ROLES.map(role => {
          const colors = getRoleColor(role)
          return (
            <button
              key={role}
              onClick={() => setFilterRole(filterRole === role ? '' : role)}
              className={cn(
                'card hover:border-surface-600 transition-all cursor-pointer text-left',
                filterRole === role && 'ring-1 ring-brand-500/50 border-brand-500/30'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border',
                  colors.bg, colors.border
                )}>
                  <Shield size={18} className={colors.text} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{roleCounts[role] || 0}</p>
                  <p className="text-[11px] text-slate-400">{ROLE_DISPLAY[role]}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 w-full h-10 text-sm"
        />
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Leads</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Tasks</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No users found</td>
                </tr>
              ) : users.map(user => {
                const colors = getRoleColor(user.role)
                return (
                  <tr key={user.id}
                    className="border-b border-surface-700/50 hover:bg-surface-800/50 transition-colors">
                    {/* User info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600
                                        flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate flex items-center gap-1.5">
                            {user.name}
                            {user.role === 'ADMIN' && <Crown size={12} className="text-amber-400 shrink-0" />}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border',
                        colors.bg, colors.text, colors.border
                      )}>
                        <Shield size={10} />
                        {ROLE_DISPLAY[user.role]}
                      </span>
                    </td>

                    {/* Stats */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-300">{user._count?.leads ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-300">{user._count?.tasks ?? 0}</span>
                    </td>

                    {/* Active status */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full',
                        user.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          user.isActive ? 'bg-emerald-400' : 'bg-red-400'
                        )} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {menuOpen === user.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 w-44 bg-surface-800 border border-surface-700
                                            rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2">
                              <button
                                onClick={() => { setEditUser(user); setMenuOpen(null) }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300
                                           hover:bg-surface-700 hover:text-white transition-colors"
                              >
                                <Edit2 size={13} /> Edit User
                              </button>
                              <button
                                onClick={() => { setResetPasswordUser(user); setMenuOpen(null) }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300
                                           hover:bg-surface-700 hover:text-white transition-colors"
                              >
                                <KeyRound size={13} /> Reset Password
                              </button>
                              <hr className="border-surface-700 my-1" />
                              <button
                                onClick={() => handleDeactivate(user)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400
                                           hover:bg-red-500/10 transition-colors"
                              >
                                <UserX size={13} /> Deactivate
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchUsers() }}
        />
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => { setEditUser(null); fetchUsers() }}
        />
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Create User Modal
// ═══════════════════════════════════════════════════════════════════════

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'COUNSELLOR' as Role })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await usersApi.create(form)
      toast.success(`${form.name} created successfully!`)
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-700">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <UserPlus size={18} className="text-brand-400" /> New Team Member
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <input type="text" className="input" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter full name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" className="input" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="user@institution.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input pr-10" required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(role => {
                const colors = getRoleColor(role)
                const selected = form.role === role
                return (
                  <button key={role} type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all',
                      selected
                        ? cn(colors.bg, colors.text, colors.border, 'ring-1 ring-brand-500/30')
                        : 'bg-surface-700/50 text-slate-400 border-surface-600 hover:border-surface-500'
                    )}>
                    {selected && <Check size={12} />}
                    <Shield size={12} />
                    {ROLE_DISPLAY[role]}
                  </button>
                )
              })}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full h-10 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Edit User Modal
// ═══════════════════════════════════════════════════════════════════════

function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role as Role, isActive: user.isActive })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await usersApi.update(user.id, form)
      toast.success('User updated successfully!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-700">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Edit2 size={18} className="text-brand-400" /> Edit User
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <input type="text" className="input" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" className="input" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(role => {
                const colors = getRoleColor(role)
                const selected = form.role === role
                return (
                  <button key={role} type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all',
                      selected
                        ? cn(colors.bg, colors.text, colors.border, 'ring-1 ring-brand-500/30')
                        : 'bg-surface-700/50 text-slate-400 border-surface-600 hover:border-surface-500'
                    )}>
                    {selected && <Check size={12} />}
                    <Shield size={12} />
                    {ROLE_DISPLAY[role]}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-700/50 rounded-lg">
            <span className="text-xs text-slate-300">Account active</span>
            <button type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative',
                form.isActive ? 'bg-emerald-500' : 'bg-surface-600'
              )}>
              <span className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
                form.isActive ? 'left-5.5 translate-x-0' : 'left-0.5'
              )} style={{ left: form.isActive ? '22px' : '2px' }} />
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full h-10 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Reset Password Modal
// ═══════════════════════════════════════════════════════════════════════

function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await usersApi.resetPassword(user.id, { password })
      toast.success(`Password reset for ${user.name}`)
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-700">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <KeyRound size={18} className="text-brand-400" /> Reset Password
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            Set a new password for <span className="text-slate-200 font-medium">{user.name}</span>
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input pr-10" required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full h-10 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
