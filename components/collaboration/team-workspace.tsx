"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Share2,
  UserPlus,
  Settings,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import type { ProcessingResult } from "@/types/figma";
import type { FigmaUser } from "@/types/figma-api";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  joinedAt: Date;
  lastActive: Date;
}

interface SharedFile {
  fileId: string;
  fileName: string;
  sharedWith: string[];
  permissions: Record<string, "view" | "edit" | "admin">;
  sharedAt: Date;
}

interface TeamWorkspaceProps {
  results: ProcessingResult[];
  userInfo?: FigmaUser;
  onShare: (fileKey: string, settings: any) => void;
}

export function TeamWorkspace({
  results,
  userInfo,
  onShare,
}: TeamWorkspaceProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      joinedAt: new Date(Date.now() - 86400000 * 30),
      lastActive: new Date(),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "editor",
      joinedAt: new Date(Date.now() - 86400000 * 15),
      lastActive: new Date(Date.now() - 86400000 * 2),
    },
  ]);

  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"editor" | "viewer">(
    "viewer",
  );

  const inviteMember = () => {
    if (!newMemberEmail.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberEmail.split("@")[0],
      email: newMemberEmail.trim(),
      role: newMemberRole,
      joinedAt: new Date(),
      lastActive: new Date(),
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setNewMemberEmail("");
  };

  const removeMember = (memberId: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const updateMemberRole = (memberId: string, newRole: TeamMember["role"]) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
    );
  };

  const shareFile = (fileId: string, fileName: string) => {
    const shareSettings = {
      permissions: "view" as const,
      expiry: null,
      allowDownload: true,
    };

    onShare(fileId, shareSettings);

    const newSharedFile: SharedFile = {
      fileId,
      fileName,
      sharedWith: teamMembers.map((m) => m.id),
      permissions: teamMembers.reduce(
        (acc, m) => ({
          ...acc,
          [m.id]: m.role === "viewer" ? "view" : "edit",
        }),
        {},
      ),
      sharedAt: new Date(),
    };

    setSharedFiles((prev) => [...prev, newSharedFile]);
  };

  const getRoleColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <div className="text-xs text-gray-600">Team Members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Share2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold">{sharedFiles.length}</div>
            <div className="text-xs text-gray-600">Shared Files</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.role === "viewer").length}
            </div>
            <div className="text-xs text-gray-600">Viewers</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Edit className="w-8 h-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold">
              {
                teamMembers.filter((m) =>
                  ["editor", "admin", "owner"].includes(m.role),
                ).length
              }
            </div>
            <div className="text-xs text-gray-600">Editors</div>
          </CardContent>
        </Card>
      </div>

      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Invite Team Member</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="memberEmail">Email Address</Label>
              <Input
                id="memberEmail"
                type="email"
                placeholder="colleague@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>

            <div className="w-32">
              <Label>Role</Label>
              <Select
                value={newMemberRole}
                onValueChange={(value: "editor" | "viewer") =>
                  setNewMemberRole(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={inviteMember} disabled={!newMemberEmail.trim()}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <span>Joined {member.joinedAt.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>
                        Active {member.lastActive.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(member.role)}>
                    {member.role}
                  </Badge>

                  {member.role !== "owner" && (
                    <Select
                      value={member.role}
                      onValueChange={(value: TeamMember["role"]) =>
                        updateMemberRole(member.id, value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share Files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{result.data.name}</div>
                    <div className="text-sm text-gray-600">
                      {Object.keys(result.data.components).length} components
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareFile(result.id, result.data.name)}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No files to share</p>
              <p className="text-sm">Process some Figma files first</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared Files */}
      {sharedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Shared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sharedFiles.map((file) => (
                <div
                  key={file.fileId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{file.fileName}</div>
                    <div className="text-sm text-gray-600">
                      Shared with {file.sharedWith.length} members •{" "}
                      {file.sharedAt.toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {file.sharedWith.length} members
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
