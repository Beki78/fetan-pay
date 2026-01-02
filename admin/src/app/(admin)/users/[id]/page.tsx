import UserDetail from '@/components/users/UserDetail'
import React from 'react'

interface UserDetailPageProps {
  params: Promise<{
    id: string
  }>
}

const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const resolvedParams = await params;

  return (
    <div>
      <UserDetail userId={resolvedParams.id} />
    </div>
  )
}

export default UserDetailPage
