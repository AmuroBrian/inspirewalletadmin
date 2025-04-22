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
import ListIcon from "@mui/icons-material/List";
import NotificationsIcon from "@mui/icons-material/Notifications";

const SideNav = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR rendering

  const menuItems = [
    { text: "Users", icon: <PersonIcon />, link: "/main" },
    { text: "Admin History", icon: <HistoryIcon />, link: "/adminhistory" },
    {
      text: "Transaction List",
      icon: <ReceiptIcon />,
      link: "/transactionhistory",
    },
    { text: "Contract List", icon: <DescriptionIcon />, link: "/contractlist" },
    //{ text: "Service List", icon: <ListIcon />, link: "/servicelist" },
    {
      text: "Notifications",
      icon: <NotificationsIcon />,
      link: "/notifications",
    },
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
      <Box
        sx={{
          overflow: "auto",
          padding: 2,
          textAlign: "center",
          marginBottom: "-16%",
        }}
      >
        {/* Box that will hold the logo like an ID photo with a white margin */}
        <Box
          sx={{
            width: 150, // Adjust size of the container
            height: 150, // Keep it square for ID photo look
            overflow: "hidden",
            margin: "0 auto", // Center it
            backgroundColor: "#fff", // Optional: for background contrast
          }}
        >
          <img
            src="/images/logo.png" // Replace with the actual logo path
            alt="Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover", // Ensures the image fills the container without distortion
            }}
          />
        </Box>
      </Box>
      <List>
        <ListItem>
          <ListItemText primary=" " sx={{ fontWeight: "bold" }} />
        </ListItem>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            {/* Wrap only ListItemButton inside Link without using component="a" */}
            <Link href={item.link} passHref legacyBehavior>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideNav;
