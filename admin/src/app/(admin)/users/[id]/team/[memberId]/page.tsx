import TeamMemberDetailPage from '@/components/users/TeamMemberDetailPage'
import React from 'react'

interface TeamMemberDetailPageProps {
  params: Promise<{ id: string; memberId: string }>;
}

export default async function TeamMemberDetailRoute({ params }: TeamMemberDetailPageProps) {
  const resolved = await params;
  return (
    <div>
      <TeamMemberDetailPage merchantId={resolved.id} memberId={resolved.memberId} />
    </div>
  );
}

