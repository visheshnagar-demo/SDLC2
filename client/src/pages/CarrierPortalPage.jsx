import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FilePlus,
  Inbox,
  RefreshCw,
  Eye,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import RichTable from "../components/common/RichTable";
import CarrierSubmissionWizard from "../components/submissions/CarrierSubmissionWizard";
import api from "../services/api";

export default function CarrierPortalPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const isNew = location.pathname.includes("/new");
  const [activeTab, setActiveTab] = useState(isNew ? "NEW" : "LIST");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("/new")) {
      setActiveTab("NEW");
    } else {
      setActiveTab("LIST");
    }
  }, [location.pathname]);

  const fetchCarrierSubmissions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      const list = Array.isArray(data)
        ? data
        : data.items || data.submissions || [];
      setSubmissions(list);
    } catch (err) {
      console.error("Failed to fetch carrier submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "LIST") {
      fetchCarrierSubmissions();
    }
  }, [activeTab]);

  const columns = [
    {
      header: "Insured Name",
      key: "insured_name",
      render: (row) => (
        <div>
          <p className="font-bold text-[#0F1729]">{row.insured_name}</p>
          <p className="text-xs text-[#66738A]">{row.industry_sector}</p>
        </div>
      ),
    },
    {
      header: "Risk Type",
      key: "risk_type",
      render: (row) => (
        <Badge
          variant={row.risk_type === "CYBER" ? "info" : "primary"}
          size="sm"
        >
          {row.risk_type === "CYBER" ? "Cyber Risk" : "D&O Liability"}
        </Badge>
      ),
    },
    {
      header: "Requested Limit",
      key: "requested_limit",
      render: (row) => (
        <span className="font-semibold text-xs text-[#0F1729]">
          ${Number(row.requested_limit || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Risk Score & Tier",
      key: "risk_score",
      render: (row) => {
        const score =
          row.composite_score !== undefined
            ? row.composite_score
            : (row.risk_score?.score ?? "N/A");
        const tier = (
          row.risk_tier ||
          row.risk_score?.tier ||
          "MEDIUM"
        ).toUpperCase();
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-[#0F1729]">{score}</span>
            <Badge variant={tier.toLowerCase()} size="sm">
              {tier}
            </Badge>
          </div>
        );
      },
    },
    {
      header: "Status",
      key: "status",
      render: (row) => {
        const status = (row.status || "PENDING").toUpperCase();
        return (
          <Badge
            variant={
              status === "QUOTED"
                ? "quoted"
                : status === "DECLINED"
                  ? "declined"
                  : "pending"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: "Action",
      key: "action",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => navigate(`/underwriting/submissions/${row.id}`)}
        >
          View Status
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      title="Carrier Self-Service Reinsurance Portal"
      subtitle="Facultative reinsurance intake, automated completeness audit, and status tracker"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#E3E8F0] pb-4">
          <button
            onClick={() => {
              setActiveTab("NEW");
              navigate("/carrier/new");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "NEW"
                ? "bg-[#2461F5] text-white shadow-sm"
                : "bg-white border border-[#E3E8F0] text-[#66738A] hover:text-[#0F1729]"
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>New Facultative Request</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("LIST");
              navigate("/carrier/submissions");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "LIST"
                ? "bg-[#2461F5] text-white shadow-sm"
                : "bg-white border border-[#E3E8F0] text-[#66738A] hover:text-[#0F1729]"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Submitted Requests</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "NEW" ? (
          <CarrierSubmissionWizard
            onSubmissionCreated={() => {
              fetchCarrierSubmissions();
            }}
          />
        ) : (
          <Card
            title={`Submitted Reinsurance Requests (${submissions.length})`}
            subtitle="Track live status and underwriter quotes on your submissions"
            action={
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={fetchCarrierSubmissions}
              >
                Refresh
              </Button>
            }
            bodyClassName="p-0"
          >
            <RichTable
              columns={columns}
              data={submissions}
              loading={loading}
              emptyMessage="No reinsurance requests submitted yet"
              onRowClick={(row) =>
                navigate(`/underwriting/submissions/${row.id}`)
              }
            />
          </Card>
        )}
      </div>
    </AppShell>
  );
}
