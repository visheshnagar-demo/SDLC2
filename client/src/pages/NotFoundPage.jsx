import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { Home, ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4">
      <Card>
        <h1 className="text-4xl font-extrabold text-slate-900 font-mono">
          404
        </h1>
        <h2 className="text-lg font-bold text-slate-800 mt-2">
          Specialty Page Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested underwriting route or facultative submission does not
          exist.
        </p>
        <div className="flex justify-center space-x-3">
          <Button
            variant="primary"
            onClick={() => navigate("/underwriter/queue")}
            icon={Home}
          >
            Underwriter Queue
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/submissions/new")}
            icon={ArrowLeft}
          >
            New Intake
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
