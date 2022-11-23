import { LinkIcon } from '@chakra-ui/icons'
import { Box, Heading, Icon, Link, Stack, Text, useColorModeValue } from '@chakra-ui/react'

import type { FeatureProps } from './types'

export const Product = ({ title, text, href }: FeatureProps) => {
  return (
    <Link _hover={{ textDecoration: 'none' }} href={href} target="_blank">
      <Stack
        _hover={{
          color: useColorModeValue('purple.600', 'purple.300'),
          boxShadow: useColorModeValue(
            '0 2px 5px #bca5e9',
            '0 0 3px rgba(150, 75, 213, 0.8), 0 3px 8px -2px rgba(175, 89, 246, 0.9)',
          ),
        }}
        borderRadius={5}
        boxShadow={useColorModeValue('0 2px 5px #ccc', '0 1px 3px #727272, 0 2px 12px -2px #2f2f2f')}
        h="full"
        justifyContent="center"
        minH={36}
        p={5}
        spacing={2.5}
      >
        <Heading fontSize="xl">{title}&ensp;&rarr;</Heading>
        <Text>{text}</Text>
      </Stack>
    </Link>
  )
}

export const Dependency = ({ title, text, href }: FeatureProps) => {
  return (
    <Link _hover={{ textDecoration: 'none' }} href={href} target="_blank">
      <Stack
        key={title}
        _hover={{
          boxShadow: useColorModeValue('0 2px 5px #ccc', '0 1px 3px #727272, 0 2px 12px -2px #2f2f2f'),
        }}
        border="1px solid"
        borderColor={useColorModeValue('blackAlpha.200', 'whiteAlpha.100')}
        borderRadius="md"
        h="full"
        isInline
        justifyContent="center"
        p={4}
        spacing={3}
      >
        <Box color={useColorModeValue('primary.500', 'primary.200')}>
          <Icon as={LinkIcon} />
        </Box>
        <Stack spacing={1}>
          <Text fontSize="lg" fontWeight="semibold">
            {title}
          </Text>
          <Text color={useColorModeValue('blackAlpha.700', 'whiteAlpha.700')} lineHeight="short">
            {text}
          </Text>
        </Stack>
      </Stack>
    </Link>
  )
}
