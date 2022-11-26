import { Box, Image, Stack, Text, useColorModeValue } from '@chakra-ui/react'

import type { ChainCardProps } from '../types'

export const ChainCard = (props: ChainCardProps) => {
  return (
    <Stack
      alignItems="center"
      color={useColorModeValue('blackAlpha.800', 'whiteAlpha.800')}
      isInline
      justifyContent="center"
      overflow="hidden"
      spacing={3}
      w="full"
      wordBreak="break-word"
    >
      <Box
        border="1px solid"
        borderColor={useColorModeValue('blackAlpha.200', 'whiteAlpha.200')}
        borderRadius="full"
        h="full"
        maxH={10}
        maxW={10}
        minH={10}
        minW={10}
        overflow="hidden"
        w="full"
      >
        <Image alt="" fallbackSrc="https://dummyimage.com/150/9e9e9e/ffffff&text=☒" src={props.icon} />
      </Box>
      <Text fontSize="xl" fontWeight="semibold" paddingEnd="18px">
        {props.prettyName}
      </Text>
    </Stack>
  )
}
