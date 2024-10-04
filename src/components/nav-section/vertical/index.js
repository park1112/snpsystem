import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { List, Box, ListSubheader } from '@mui/material';
//
import { NavListRoot } from './NavList';
import useSidebarConfig from '../../../layouts/dashboard/navbar/NavConfig';

// ----------------------------------------------------------------------

export const ListSubheaderStyle = styled((props) => <ListSubheader disableSticky disableGutters {...props} />)(
  ({ theme }) => ({
    ...theme.typography.overline,
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shorter,
    }),
  })
);

// ----------------------------------------------------------------------

NavSectionVertical.propTypes = {
  isCollapse: PropTypes.bool,
  navConfig: PropTypes.array,
};

export default function NavSectionVertical({ navConfig: propNavConfig = [], isCollapse = false, ...other }) {
  const dynamicNavConfig = useSidebarConfig();
  const [combinedNavConfig, setCombinedNavConfig] = useState([]);

  const memoizedDynamicNavConfig = useMemo(() => dynamicNavConfig, [dynamicNavConfig]);

  useEffect(() => {
    // Ensure both configs are arrays
    const safePropsConfig = Array.isArray(propNavConfig) ? propNavConfig : [];
    const safeDynamicConfig = Array.isArray(memoizedDynamicNavConfig) ? memoizedDynamicNavConfig : [];

    // Combine the configs safely
    const newCombinedConfig = [
      ...safeDynamicConfig,
      ...safePropsConfig.filter(item =>
        !safeDynamicConfig.some(dynamicItem => dynamicItem.subheader === item.subheader)
      )
    ];

    // Only update if there's a change
    if (JSON.stringify(newCombinedConfig) !== JSON.stringify(combinedNavConfig)) {
      setCombinedNavConfig(newCombinedConfig);
    }
  }, [memoizedDynamicNavConfig, propNavConfig]);

  return (
    <Box {...other}>
      {combinedNavConfig.map((group) => (
        <List key={group.subheader} disablePadding sx={{ px: 2 }}>
          <ListSubheaderStyle
            sx={{
              ...(isCollapse && {
                opacity: 0,
              }),
            }}
          >
            {group.subheader}
          </ListSubheaderStyle>

          {group.items && Array.isArray(group.items) && group.items.map((list) => (
            <NavListRoot key={list.title} list={list} isCollapse={isCollapse} />
          ))}
        </List>
      ))}
    </Box>
  );
}