import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import type { TeamMember, TeamInvite, Team, TeamRole, TeamSettings as TeamSettingsType } from '../../types/settings';

const mockTeam: Team = {
  id: 'team_1',
  name: 'Acme Corporation',
  slug: 'acme-corp',
  createdAt: '2024-01-15T00:00:00Z',
  settings: {
    allowMemberInvites: false,
    requireTwoFactor: true,
    defaultRole: 'member',
    allowedDomains: ['acme.com', 'acme.io'],
  },
};

const mockMembers: TeamMember[] = [
  {
    id: 'user_1',
    email: 'john@acme.com',
    name: 'John Smith',
    avatar: undefined,
    role: 'owner',
    joinedAt: '2024-01-15T00:00:00Z',
    lastActiveAt: '2025-01-18T10:30:00Z',
    status: 'active',
  },
  {
    id: 'user_2',
    email: 'jane@acme.com',
    name: 'Jane Doe',
    avatar: undefined,
    role: 'admin',
    joinedAt: '2024-02-01T00:00:00Z',
    lastActiveAt: '2025-01-17T14:22:00Z',
    status: 'active',
  },
  {
    id: 'user_3',
    email: 'bob@acme.com',
    name: 'Bob Wilson',
    avatar: undefined,
    role: 'member',
    joinedAt: '2024-03-15T00:00:00Z',
    lastActiveAt: '2025-01-16T09:15:00Z',
    status: 'active',
  },
  {
    id: 'user_4',
    email: 'alice@acme.com',
    name: 'Alice Johnson',
    avatar: undefined,
    role: 'viewer',
    joinedAt: '2024-06-01T00:00:00Z',
    lastActiveAt: '2025-01-10T16:45:00Z',
    status: 'active',
  },
];

const mockInvites: TeamInvite[] = [
  {
    id: 'invite_1',
    email: 'charlie@acme.com',
    role: 'member',
    invitedBy: 'john@acme.com',
    invitedAt: '2025-01-15T00:00:00Z',
    expiresAt: '2025-01-22T00:00:00Z',
    status: 'pending',
  },
];

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

export function TeamSettings() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamSettings, setTeamSettings] = useState(mockTeam.settings);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');

  // Team name state
  const [teamName, setTeamName] = useState(mockTeam.name);
  const [teamSlug, setTeamSlug] = useState(mockTeam.slug);

  const handleInvite = () => {
    // Handle invite logic here
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('member');
  };

  const handleRemoveMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
  };

  const handleChangeRole = (member: TeamMember) => {
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const getRoleBadge = (role: TeamRole) => {
    const variants: Record<TeamRole, 'info' | 'success' | 'default' | 'warning'> = {
      owner: 'info',
      admin: 'success',
      member: 'default',
      viewer: 'warning',
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'deactivated':
        return <Badge variant="danger">Deactivated</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Team Info */}
      <Card>
        <CardHeader
          title="Team Information"
          description="Update your team's basic information"
        />
        <CardContent className="space-y-4">
          <Input
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <Input
            label="Team Slug"
            value={teamSlug}
            onChange={(e) => setTeamSlug(e.target.value)}
            helperText="Used in URLs: app.foop.io/team/your-slug"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader
          title="Team Members"
          description={`${mockMembers.length} members in your team`}
          action={
            <Button onClick={() => setShowInviteModal(true)}>
              Invite Member
            </Button>
          }
        />
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {mockMembers.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {getInitials(member.name)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      {getRoleBadge(member.role)}
                    </div>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Last active: {formatDate(member.lastActiveAt)}
                  </span>
                  {member.role !== 'owner' && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChangeRole(member)}
                      >
                        Change Role
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {mockInvites.length > 0 && (
        <Card>
          <CardHeader
            title="Pending Invitations"
            description="Invitations that haven't been accepted yet"
          />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {mockInvites.map((invite) => (
                <div key={invite.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      {getRoleBadge(invite.role)}
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Invited by {invite.invitedBy} • Expires {formatDate(invite.expiresAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Resend
                    </Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Settings */}
      <Card>
        <CardHeader
          title="Team Settings"
          description="Configure team permissions and security"
        />
        <CardContent className="space-y-6">
          <Toggle
            enabled={teamSettings.allowMemberInvites}
            onChange={(enabled) =>
              setTeamSettings({ ...teamSettings, allowMemberInvites: enabled })
            }
            label="Allow members to invite"
            description="Members can invite new users (admins can always invite)"
          />
          <Toggle
            enabled={teamSettings.requireTwoFactor}
            onChange={(enabled) =>
              setTeamSettings({ ...teamSettings, requireTwoFactor: enabled })
            }
            label="Require two-factor authentication"
            description="All team members must enable 2FA"
          />
          <div>
            <Select
              label="Default role for new members"
              options={roleOptions}
              value={teamSettings.defaultRole}
              onChange={(value) =>
                setTeamSettings({ ...teamSettings, defaultRole: value as TeamRole })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed email domains
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Only users with these email domains can be invited
            </p>
            <div className="flex flex-wrap gap-2">
              {teamSettings.allowedDomains.map((domain) => (
                <span
                  key={domain}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  @{domain}
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-gray-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add domain
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader
          title="Danger Zone"
          description="Irreversible actions for your team"
        />
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-900">Delete Team</h4>
              <p className="text-sm text-red-700">
                Permanently delete this team and all its data. This action cannot be undone.
              </p>
            </div>
            <Button variant="danger">Delete Team</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={inviteRole}
            onChange={(value) => setInviteRole(value as TeamRole)}
          />
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h4>
            <ul className="text-sm text-gray-500 space-y-1">
              <li><strong>Admin:</strong> Full access, can manage team and billing</li>
              <li><strong>Member:</strong> Can create and manage automations</li>
              <li><strong>Viewer:</strong> Read-only access to automations and data</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!inviteEmail}>
            Send Invitation
          </Button>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Team Member"
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to remove <strong>{selectedMember?.name}</strong> from the team?
          They will lose access to all team resources immediately.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setShowRemoveModal(false);
              setSelectedMember(null);
            }}
          >
            Remove Member
          </Button>
        </div>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change Role"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Change the role for <strong>{selectedMember?.name}</strong>
          </p>
          <Select
            label="New Role"
            options={roleOptions}
            value={selectedMember?.role || 'member'}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowRoleModal(false);
              setSelectedMember(null);
            }}
          >
            Update Role
          </Button>
        </div>
      </Modal>
    </div>
  );
}
