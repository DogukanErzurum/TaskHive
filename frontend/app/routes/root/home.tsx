import React from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHive" },
    { name: "description", content: "TaskHive'e Hoşgeldiniz" },
  ];
}

const Homepage = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center gap-4">
      <Link to="/sign-in">
        <Button className="bg-blue-500 text-white">Giriş</Button>
      </Link>
      <Link to="/sign-up">
        <Button variant="outline" className="bg-blue-500 text-white">
          Kayıt Ol
        </Button>
      </Link>
    </div>
  );
};

export default Homepage;