import EditPlanForm from '@/components/billing/EditPlanForm'
import React from 'react'

interface EditPlanPageProps {
  params: Promise<{
    id: string
  }>
}

const EditPlanPage = async ({ params }: EditPlanPageProps) => {
  const resolvedParams = await params;

  return (
    <div>
      <EditPlanForm planId={resolvedParams.id} />
    </div>
  )
}

export default EditPlanPage
