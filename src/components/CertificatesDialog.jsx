import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import {
  buildCertificateTrail,
  downloadTrailAppendix,
  downloadTrailCertificate,
  fmtListDate,
  posForEntry,
} from "../utils/ihmCertificate";

const headSx = { color: "#2f80c9", fontSize: 15, fontWeight: 500, borderBottom: "2px solid #8bc34a", whiteSpace: "nowrap" };

const downloadButtonSx = {
  textTransform: "none",
  bgcolor: "#4fa3e0",
  "&:hover": { bgcolor: "#2f80c9" },
  fontWeight: 500,
  px: 1.5,
  whiteSpace: "nowrap",
};

// Certificate document icon, like the legacy list.
const CertificateIcon = () => (
  <Box
    sx={{
      width: 38,
      height: 44,
      border: "1px solid #b0bec5",
      borderRadius: "3px",
      bgcolor: "#fafafa",
      boxShadow: "1px 1px 2px rgba(0,0,0,0.15)",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      p: "6px 6px 0",
      boxSizing: "border-box",
    }}
  >
    {[70, 90, 60, 80].map((w, i) => (
      <Box key={i} sx={{ height: "2px", width: `${w}%`, bgcolor: "#90a4ae" }} />
    ))}
    <WorkspacePremiumIcon sx={{ position: "absolute", right: -2, bottom: -3, fontSize: 18, color: "#f9a825" }} />
  </Box>
);

/**
 * IHM maintenance certificate trail for a vessel: one certificate per month of
 * maintenance plus the ANNUAL one, each with its PDF and, when POs were
 * reviewed that month, an Appendix. Admins can make a certificate inactive,
 * which hides it from other (ship) users.
 */
export default function CertificatesDialog({ open, onClose, vessel, vesselId, purchaseOrders, poLoading }) {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["userData"])?.data;
  const isAdmin = user?.roles === "ADMIN";
  const [confirmEntry, setConfirmEntry] = useState(null);

  const states = useQuery({
    queryKey: ["ihmCertificates", vesselId],
    queryFn: async () => (await axiosInstance.get(`/vessels/${vesselId}/ihm-certificates`)).data.data.states,
    enabled: open && !!vesselId,
  });

  const activeByPeriod = useMemo(
    () => Object.fromEntries((states.data ?? []).map((s) => [s.period, s.isActive])),
    [states.data]
  );
  const isActive = (entry) => activeByPeriod[entry.period] !== false;

  const trail = useMemo(() => (vessel ? buildCertificateTrail(vessel) : []), [vessel]);
  // Ship (non-admin) users only see active certificates.
  const rows = isAdmin ? trail : trail.filter(isActive);

  const setActive = useMutation({
    mutationFn: ({ entry, value }) =>
      axiosInstance.patch(`/vessels/${vesselId}/ihm-certificates/${entry.period}`, { isActive: value }),
    onSuccess: (_, { entry, value }) => {
      queryClient.invalidateQueries({ queryKey: ["ihmCertificates", vesselId] });
      toast.success(`Certificate ${entry.certificateNo} ${value ? "activated" : "made inactive"}`);
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Could not update the certificate"),
  });

  const handleToggle = (entry) => {
    if (isActive(entry)) {
      setConfirmEntry(entry);
    } else {
      setActive.mutate({ entry, value: true });
    }
  };

  const loading = !vessel || states.isPending;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: "#e3f2fd", color: "#2f80c9", fontSize: 22, fontWeight: 500, py: 1.5, borderBottom: "1px solid #cfe3f5" }}>
          Certificates
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important" }}>
          <TableContainer sx={{ border: "1px solid #ddd", maxHeight: "62vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...headSx, width: 70, bgcolor: "#fff" }} />
                  <TableCell sx={{ ...headSx, bgcolor: "#fff" }}>Maintenance Certificate</TableCell>
                  <TableCell align="center" sx={{ ...headSx, bgcolor: "#fff" }}>Is Active</TableCell>
                  <TableCell align="center" sx={{ ...headSx, bgcolor: "#fff" }}>Certificate</TableCell>
                  <TableCell align="center" sx={{ ...headSx, bgcolor: "#fff" }}>Appendix</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading &&
                  [0, 1, 2].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton height={40} />
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      {trail.length
                        ? "No active certificates."
                        : "No certificates yet. Certificates start from the vessel's Maintenance Start Date."}
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  rows.map((entry) => {
                    const pos = posForEntry(purchaseOrders, entry);
                    const active = isActive(entry);
                    return (
                      <TableRow key={entry.period} hover sx={{ opacity: active ? 1 : 0.6 }}>
                        <TableCell>
                          <CertificateIcon />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "grid", gridTemplateColumns: "90px minmax(0, 1fr)", rowGap: 0.25 }}>
                            <Typography variant="body2">Number</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-all" }}>
                              {entry.certificateNo}
                            </Typography>
                            <Typography variant="body2">Period</Typography>
                            <Typography variant="body2">
                              {fmtListDate(entry.from)} to {fmtListDate(entry.till)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={isAdmin ? (active ? "Make inactive (hide from ship)" : "Make active") : ""}>
                            <span>
                              <Checkbox
                                checked={active}
                                disabled={!isAdmin || setActive.isPending}
                                onChange={() => handleToggle(entry)}
                                inputProps={{ "aria-label": `Is active ${entry.certificateNo}` }}
                                sx={{ "& .MuiSvgIcon-root": { fontSize: 30 } }}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            disableElevation
                            startIcon={<FileDownloadIcon />}
                            onClick={() => downloadTrailCertificate(vessel, entry)}
                            sx={downloadButtonSx}
                          >
                            Certificate
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          {poLoading ? (
                            <Skeleton width={110} height={36} sx={{ mx: "auto" }} />
                          ) : pos.length > 0 ? (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                startIcon={<FileDownloadIcon />}
                                onClick={() => downloadTrailAppendix(vessel, entry, pos)}
                                sx={downloadButtonSx}
                              >
                                Appendix
                              </Button>
                              <Typography variant="body2" sx={{ mt: 0.25 }}>
                                ({pos.length} PO{pos.length === 1 ? "" : "s"})
                              </Typography>
                            </>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 160, textTransform: "none", fontSize: 16 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation before hiding a certificate from the ship */}
      <Dialog open={!!confirmEntry} onClose={() => setConfirmEntry(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HelpOutlineIcon sx={{ color: "#2f80c9" }} />
          </Box>
          OptiHazmat Info
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            This will hide this Certificate from Ship, Are you sure to Inactive this Certificate?
          </Typography>
          {confirmEntry && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {confirmEntry.certificateNo}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setConfirmEntry(null)} sx={{ textTransform: "none", minWidth: 80 }}>
            No
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              setActive.mutate({ entry: confirmEntry, value: false });
              setConfirmEntry(null);
            }}
            sx={{ textTransform: "none", minWidth: 80, bgcolor: "#4fa3e0", "&:hover": { bgcolor: "#2f80c9" } }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
