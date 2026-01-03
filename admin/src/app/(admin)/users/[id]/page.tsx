import UserDetail from '@/components/users/UserDetail'
import React from 'react'

interface UserDetailPageProps {
  params: Promise<{ id: string }>; // Next passes params as a Promise in this route
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const resolved = await params;
  return (
    <div>
      <UserDetail userId={resolved.id} />
    </div>
  );
}
