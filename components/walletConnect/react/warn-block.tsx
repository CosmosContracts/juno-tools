import { Box, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { WalletStatus } from '@cosmos-kit/core'
import type { ReactNode } from 'react'
import React from 'react'

export const WarnBlock = ({ wordOfWarning, icon }: { wordOfWarning?: string; icon?: ReactNode }) => {
  return (
    <Box bg={useColorModeValue('orange.200', 'orange.300')} borderRadius="md" color="blackAlpha.900" p={4} pr={2}>
      <Stack
        alignItems="start"
        css={{
          // For Firefox
          scrollbarWidth: 'auto',
          scrollbarColor: useColorModeValue(
            'rgba(0,0,0,0.3) rgba(0,0,0,0.2)',
            'rgba(255,255,255,0.2) rgba(255,255,255,0.1)',
          ),
          // For Chrome and other browsers except Firefox
          '&::-webkit-scrollbar': {
            width: '14px',
            background: useColorModeValue('rgba(220,220,220,0.1)', 'rgba(60,60,60,0.1)'),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)'),
            borderRadius: '10px',
            border: '3px solid transparent',
            backgroundClip: 'content-box',
          },
        }}
        isInline
        justifyContent="center"
        overflowY="scroll"
        spacing={2}
        w="full"
      >
        <Box position="sticky" top={0}>
          {icon}
        </Box>
        <Text maxH={40}>{wordOfWarning}</Text>
      </Stack>
    </Box>
  )
}

export const RejectedWarn = ({ wordOfWarning, icon }: { wordOfWarning?: string; icon?: ReactNode }) => {
  return <WarnBlock icon={icon} wordOfWarning={wordOfWarning} />
}

export const ConnectStatusWarn = ({
  walletStatus,
  rejected,
  error,
}: {
  walletStatus: WalletStatus
  rejected: ReactNode
  error: ReactNode
}) => {
  switch (walletStatus) {
    case WalletStatus.Rejected:
      return <>{rejected}</>
    case WalletStatus.Error:
      return <>{error}</>
    default:
      return <></>
  }
}
