import { Button, Icon, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { WalletStatus } from '@cosmos-kit/core'
import type { MouseEventHandler, ReactNode } from 'react'
import React from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { IoWallet } from 'react-icons/io5'

import type { ConnectWalletType } from '../types'

export const ConnectWalletButton = ({
  buttonText,
  isLoading,
  isDisabled,
  icon,
  onClickConnectBtn,
}: ConnectWalletType) => {
  return (
    <Button
      _active={{
        bgImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
        opacity: 0.9,
      }}
      _hover={{
        bgImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
        opacity: 0.75,
      }}
      bgImage="linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)"
      color="white"
      isDisabled={isDisabled}
      isLoading={isLoading}
      minW="fit-content"
      onClick={onClickConnectBtn}
      opacity={1}
      size="lg"
      transition="all .5s ease-in-out"
      w="full"
    >
      <Icon as={icon ? icon : IoWallet} mr={2} />
      {buttonText ? buttonText : 'Connect Wallet'}
    </Button>
  )
}

export const Disconnected = ({
  buttonText,
  onClick,
}: {
  buttonText: string
  onClick: MouseEventHandler<HTMLButtonElement>
}) => {
  return <ConnectWalletButton buttonText={buttonText} onClickConnectBtn={onClick} />
}

export const Connected = ({
  buttonText,
  onClick,
}: {
  buttonText: string
  onClick: MouseEventHandler<HTMLButtonElement>
}) => {
  return <ConnectWalletButton buttonText={buttonText} onClickConnectBtn={onClick} />
}

export const Connecting = () => {
  return <ConnectWalletButton isLoading />
}

export const Rejected = ({
  buttonText,
  wordOfWarning,
  onClick,
}: {
  buttonText: string
  wordOfWarning?: string
  onClick: MouseEventHandler<HTMLButtonElement>
}) => {
  const bg = useColorModeValue('orange.200', 'orange.300')

  return (
    <Stack>
      <ConnectWalletButton buttonText={buttonText} isDisabled={false} onClickConnectBtn={onClick} />
      {wordOfWarning && (
        <Stack bg={bg} borderRadius="md" color="blackAlpha.900" isInline p={4} spacing={1}>
          <Icon as={FiAlertTriangle} mt={1} />
          <Text>
            <Text as="span" fontWeight="semibold">
              Warning:&ensp;
            </Text>
            {wordOfWarning}
          </Text>
        </Stack>
      )}
    </Stack>
  )
}

export const Error = ({
  buttonText,
  wordOfWarning,
  onClick,
}: {
  buttonText: string
  wordOfWarning?: string
  onClick: MouseEventHandler<HTMLButtonElement>
}) => {
  const bg = useColorModeValue('orange.200', 'orange.300')

  return (
    <Stack>
      <ConnectWalletButton buttonText={buttonText} isDisabled={false} onClickConnectBtn={onClick} />
      {wordOfWarning && (
        <Stack bg={bg} borderRadius="md" color="blackAlpha.900" isInline p={4} spacing={1}>
          <Icon as={FiAlertTriangle} mt={1} />
          <Text>
            <Text as="span" fontWeight="semibold">
              Warning:&ensp;
            </Text>
            {wordOfWarning}
          </Text>
        </Stack>
      )}
    </Stack>
  )
}

export const NotExist = ({
  buttonText,
  onClick,
}: {
  buttonText: string
  onClick: MouseEventHandler<HTMLButtonElement>
}) => {
  return <ConnectWalletButton buttonText={buttonText} isDisabled={false} onClickConnectBtn={onClick} />
}

export const WalletConnectComponent = ({
  walletStatus,
  disconnect,
  connecting,
  connected,
  rejected,
  error,
  notExist,
}: {
  walletStatus: WalletStatus
  disconnect: ReactNode
  connecting: ReactNode
  connected: ReactNode
  rejected: ReactNode
  error: ReactNode
  notExist: ReactNode
}) => {
  switch (walletStatus) {
    case WalletStatus.Disconnected:
      return <>{disconnect}</>
    case WalletStatus.Connecting:
      return <>{connecting}</>
    case WalletStatus.Connected:
      return <>{connected}</>
    case WalletStatus.Rejected:
      return <>{rejected}</>
    case WalletStatus.Error:
      return <>{error}</>
    case WalletStatus.NotExist:
      return <>{notExist}</>
    default:
      return <>{disconnect}</>
  }
}
