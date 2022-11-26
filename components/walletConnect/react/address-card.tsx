import { Button, Icon, Text, useClipboard, useColorModeValue } from '@chakra-ui/react'
import { WalletStatus } from '@cosmos-kit/core'
import type { ReactNode } from 'react'
import React from 'react'
import { FaRegCopy } from 'react-icons/fa'

export const ConnectedShowAddress = ({ address, isLoading }: { address?: string; isLoading: boolean }) => {
  const { hasCopied, onCopy } = useClipboard(address ? address : '')

  return (
    <Button
      bg={useColorModeValue('white', 'blackAlpha.500')}
      borderRadius="full"
      boxShadow={useColorModeValue('0 0 2px #ccc', '0 1px 2px #333')}
      h="fit-content"
      isDisabled={address ? hasCopied : true}
      isLoading={isLoading}
      onClick={() => onCopy()}
      px={4}
      py={1.5}
      rightIcon={<Icon as={FaRegCopy} h={3} w={3} />}
      w="fit-content"
    >
      <Text
        _before={{
          content: 'attr(title)',
          width: '25%',
          float: 'right',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          direction: 'rtl',
        }}
        _hover={{
          cursor: 'inherit',
        }}
        fontSize={{ base: 'xs', md: 'sm' }}
        fontWeight="normal"
        height="1.25em"
        letterSpacing="0.4px"
        maxW={{ base: 40, md: 48 }}
        opacity={0.8}
        overflow="hidden"
        position="relative"
        title={address}
        whiteSpace="break-spaces"
      >
        {address ? address : 'address not identified yet'}
      </Text>
    </Button>
  )
}

export const CopyAddressBtn = ({ walletStatus, connected }: { walletStatus: WalletStatus; connected: ReactNode }) => {
  switch (walletStatus) {
    case WalletStatus.Connected:
      return <>{connected}</>
    default:
      return <></>
  }
}
