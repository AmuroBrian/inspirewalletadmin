"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DescriptionIcon from "@mui/icons-material/Description";
import ListIcon from '@mui/icons-material/List';

const SideNav = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR rendering

  const menuItems = [
    { text: "Users", icon: <PersonIcon />, link: "/dashboard/main" },
    { text: "Admin History", icon: <HistoryIcon />, link: "/dashboard/sample" },
    { text: "Transaction List", icon: <ReceiptIcon />, link: "/dashboard/transactionhistory" },
    { text: "Contract List", icon: <DescriptionIcon />, link: "/dashboard/contractlist" },
    { text: "Service List", icon: <ListIcon />, link: "/dashboard/servicelist" },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
          bgcolor: "#F7F3FC",
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItem>
            <ListItemText primary="" sx={{ fontWeight: "bold" }} />
          </ListItem>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <Link href={item.link} passHref>
                <ListItemButton component="Link">
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideNav;
