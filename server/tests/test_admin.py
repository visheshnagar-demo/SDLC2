def test_admin_audit_logs_access_control(
    client, customer_headers, officer_headers, admin_headers
):
    # Customer forbidden
    res_customer = client.get("/api/v1/admin/audit-logs", headers=customer_headers)
    assert res_customer.status_code == 403

    # Compliance officer forbidden
    res_officer = client.get("/api/v1/admin/audit-logs", headers=officer_headers)
    assert res_officer.status_code == 403

    # Admin allowed
    res_admin = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert res_admin.status_code == 200
    data = res_admin.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)


def test_admin_audit_logs_filter(client, admin_headers):
    res = client.get(
        "/api/v1/admin/audit-logs?action=AUTH_LOGIN", headers=admin_headers
    )
    assert res.status_code == 200
    data = res.json()
    for item in data["items"]:
        assert item["action"] == "AUTH_LOGIN"


def test_admin_audit_logs_export_json(client, admin_headers):
    res = client.get(
        "/api/v1/admin/audit-logs/export?format=json", headers=admin_headers
    )
    assert res.status_code == 200
    assert "application/json" in res.headers["content-type"]
    assert len(res.content) > 0


def test_admin_audit_logs_export_csv(client, admin_headers):
    res = client.get(
        "/api/v1/admin/audit-logs/export?format=csv", headers=admin_headers
    )
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    lines = res.text.split("\n")
    assert len(lines) >= 1
    assert "id,user_id,action,resource" in lines[0]
