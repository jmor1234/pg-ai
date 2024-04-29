import { checkSubscription } from '@/lib/subscription'
import React from 'react'
import SubscriptionButton from '@/components/subscriptionButton';

const SettingsPage = async () => {
    const isPro = await checkSubscription()
  return (
    <div className='h-full p-4 space-y-2'>
        <h3 className='text-lg font-medium'>
            Settings
        </h3>
        <div className='text-muted-foreground text-sm'>
            {isPro ? "You are currently subscribed to the Pro plan" : "You are currently subscribed to the Free plan"}
        </div>
        <SubscriptionButton isPro={isPro} />
    </div>
  )
}

export default SettingsPage