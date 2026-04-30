import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AlertIcon } from './AlertIcon'
import { ArrowIcon } from './ArrowIcon'
import { BackIcon } from './BackIcon'
import { BoltIcon } from './BoltIcon'
import { BrandMarkIcon } from './BrandMarkIcon'
import { CheckIcon } from './CheckIcon'
import { CloseIcon } from './CloseIcon'
import { ConversationIllustration } from './ConversationIllustration'
import { DeviceLockIcon } from './DeviceLockIcon'
import { DocumentIcon } from './DocumentIcon'
import { DownloadIcon } from './DownloadIcon'
import { MailIcon } from './MailIcon'
import { MailSendIcon } from './MailSendIcon'
import { MessageIcon } from './MessageIcon'
import { ProfileIcon } from './ProfileIcon'
import { RingsIcon } from './RingsIcon'
import { SecurityIcon } from './SecurityIcon'
import { SsoProviderIcon } from './SsoProviderIcon'
import { SparkleIcon } from './SparkleIcon'
import { TargetIcon } from './TargetIcon'
import { TrophyIcon } from './TrophyIcon'
import { TrashIcon } from './TrashIcon'
import { UploadIcon } from './UploadIcon'

describe('icon set', () => {
  it('renders the shared svg primitives', () => {
    const { container } = render(
      <>
        <BrandMarkIcon />
        <CloseIcon />
        <UploadIcon />
        <MailIcon />
        <MailSendIcon />
        <TrashIcon />
        <AlertIcon />
        <CheckIcon />
        <ArrowIcon />
        <BackIcon />
        <TargetIcon />
        <TrophyIcon />
        <BoltIcon />
        <ProfileIcon />
        <SecurityIcon />
        <DocumentIcon />
        <MessageIcon />
        <DeviceLockIcon />
        <SparkleIcon />
        <DownloadIcon />
        <SsoProviderIcon provider="google" />
        <ConversationIllustration />
        <RingsIcon offsets={[0, 0, 0]} />
      </>
    )

    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(30)
  })
})
