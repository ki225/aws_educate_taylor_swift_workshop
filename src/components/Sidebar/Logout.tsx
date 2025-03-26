"use client";

import { Button } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";

export const LogoutButton = () => {
  return (
    <Button fontSize="14px"
      onClick={() => {
        signOut();
      }}
    >
      Logout
    </Button>
  );
};