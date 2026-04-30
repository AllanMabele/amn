"use client";
import { supabase } from "./supabaseClient";

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error("Not logged in");
  return data.session.access_token;
}

// 1. Update Ticket Status
export async function updateTicketStatus(support_ticket_id: string, status: string) {
  const token = await getAccessToken();
  const { data, error } = await supabase.functions.invoke("admin-update-ticket-status", {
    body: { support_ticket_id, status },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data;
}

// 2. Update Service Request
export async function updateServiceRequest(service_request_id: string, status: string, notes: string) {
  const token = await getAccessToken();
  const { data, error } = await supabase.functions.invoke("admin-update-service-request", {
    body: { service_request_id, status, admin_notes: notes },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data;
}