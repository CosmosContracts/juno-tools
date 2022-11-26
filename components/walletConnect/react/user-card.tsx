import { Box, Stack, Text } from '@chakra-ui/react'
import React from 'react'

import type { ConnectedUserCardType } from '../types'

export const ConnectedUserInfo = ({ username, icon }: ConnectedUserCardType) => {
  return (
    <Stack alignItems="center" spacing={1}>
      {username && (
        <>
          <Box
            borderRadius="full"
            display={icon ? 'block' : 'none'}
            h={20}
            maxH={20}
            maxW={20}
            minH={20}
            minW={20}
            overflow="hidden"
            w={20}
          >
            {icon}
          </Box>
          <Text fontSize={{ md: 'xl' }} fontWeight="semibold">
            {username}
          </Text>
        </>
      )}
    </Stack>
  )
}
