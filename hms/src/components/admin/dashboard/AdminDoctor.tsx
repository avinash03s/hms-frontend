import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { useEffect, useState } from "react";

import {
  deleteDoctor,
  getAllDoctors,
} from "../../../service/AdminService";

const specializationColors: Record<string, string> = {
  Cardiology: "red",
  Neurology: "violet",
  Orthopedics: "blue",
  Pediatrics: "yellow",
  Dermatology: "pink",
  Oncology: "grape",
  Radiology: "cyan",
  Psychiatry: "indigo",
  Surgery: "orange",
  General: "teal",
};

const avatarColors = [
  "teal",
  "blue",
  "violet",
  "grape",
  "pink",
  "red",
  "orange",
  "cyan",
];

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "D";

const getAvatarColor = (name: string) =>
  avatarColors[
    (name?.charCodeAt(0) || 0) % avatarColors.length
  ] || "teal";

const getSpecColor = (spec: string) =>
  specializationColors[spec] ||
  avatarColors[
    (spec?.charCodeAt(0) || 0) % avatarColors.length
  ] ||
  "teal";

const AdminDoctor = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const loadDoctors = async () => {
    setLoading(true);

    try {
      const res = await getAllDoctors();

      setDoctors(res.data);
      setFiltered(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);

    const q = value.toLowerCase();

    setFiltered(
      doctors.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.email?.toLowerCase().includes(q) ||
          d.specialization?.toLowerCase().includes(q)
      )
    );
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteDoctor(deleteId);

      setDeleteModalOpen(false);
      setDeleteId(null);

      loadDoctors();
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <Box
      p="md"
      style={{
        minHeight: "100vh",
        background: "#f8fafb",
        overflowX: "hidden",
        padding: "clamp(12px, 2vw, 24px)",
      }}
    >
      {/* Header */}

      <Group
        justify="space-between"
        mb="xl"
        align="center"
        wrap="wrap"
        gap="md"
      >
        <Title
          order={2}
          style={{
            color: "#20c997",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            fontSize: "clamp(1.4rem, 2vw, 2rem)",
          }}
        >
          Doctors
        </Title>

        <Group
          gap="sm"
          wrap="wrap"
          style={{
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          <TextInput
            placeholder="Search doctors..."
            value={search}
            onChange={(e) =>
              handleSearch(e.currentTarget.value)
            }
            radius="xl"
            styles={{
              root: {
                width: "100%",
                maxWidth: 280,
              },

              input: {
                border: "1.5px solid #e0f5ef",
                background: "#fff",
              },
            }}
            leftSection={
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="#20c997"
                  strokeWidth="2"
                />

                <path
                  d="M16.5 16.5L21 21"
                  stroke="#20c997"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <Badge
            size="lg"
            radius="xl"
            color="teal"
            variant="light"
            style={{
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            {filtered.length} Doctors
          </Badge>
        </Group>
      </Group>

      {/* Loading */}

      {loading && (
        <Group justify="center" mt={80}>
          <Loader color="teal" size="xl" />
        </Group>
      )}

      {/* Doctor Grid */}

      {!loading && (
        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
            lg: 3,
            xl: 4,
          }}
          spacing="lg"
        >
          {filtered.map((doctor) => (
            <Box
              key={doctor.id}
              style={{
                width: "100%",
                minWidth: 0,
              }}
            >
              <Card
                shadow="sm"
                radius="xl"
                p={0}
                style={{
                  border: "1.5px solid #e8f5f0",
                  overflow: "hidden",
                  transition: "0.2s",
                  cursor: "pointer",
                  height: "100%",
                }}
              >
                {/* Top Accent */}

                <Box
                  style={{
                    height: 4,
                    background:
                      "linear-gradient(90deg, #20c997, #12b886)",
                  }}
                />

                <Box
                  p="lg"
                  style={{
                    padding:
                      "clamp(14px, 2vw, 22px)",
                  }}
                >
                  {/* Avatar + Name */}

                  <Group
                    gap="md"
                    mb="md"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <Avatar
                      size={56}
                      radius="xl"
                      color={getAvatarColor(
                        doctor.name || ""
                      )}
                      style={{
                        width:
                          "clamp(48px, 5vw, 56px)",
                        height:
                          "clamp(48px, 5vw, 56px)",
                        border:
                          "2.5px solid #e0f5ef",
                        boxShadow:
                          "0 2px 8px rgba(32,201,151,0.15)",
                        fontWeight: 700,
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(
                        doctor.name || "D"
                      )}
                    </Avatar>

                    <Stack
                      gap={2}
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Text
                        fw={700}
                        size="md"
                        lineClamp={2}
                        style={{
                          color: "#1a1a2e",
                          lineHeight: 1.2,
                          wordBreak: "break-word",
                        }}
                      >
                        {doctor.name}
                      </Text>

                      <Badge
                        size="sm"
                        radius="md"
                        color={getSpecColor(
                          doctor.specialization
                        )}
                        variant="light"
                        style={{
                          width: "fit-content",
                          fontWeight: 600,
                          maxWidth: "100%",
                        }}
                      >
                        {doctor.specialization ||
                          "General"}
                      </Badge>
                    </Stack>
                  </Group>

                  {/* Divider */}

                  <Box
                    style={{
                      height: 1,
                      background: "#e8f5f0",
                      marginBottom: 14,
                    }}
                  />

                  {/* Info */}

                  <Stack gap={10}>
                    {/* Email */}

                    <Group
                      gap="xs"
                      align="center"
                      wrap="nowrap"
                    >
                      <Box
                        style={{
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="4"
                            width="20"
                            height="16"
                            rx="3"
                            stroke="#20c997"
                            strokeWidth="1.8"
                          />

                          <path
                            d="M2 8l10 6 10-6"
                            stroke="#20c997"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </Box>

                      <Text
                        size="xs"
                        c="dimmed"
                        lineClamp={2}
                        style={{
                          wordBreak: "break-word",
                          minWidth: 0,
                        }}
                      >
                        {doctor.email || "—"}
                      </Text>
                    </Group>

                    {/* Phone */}

                    {doctor.phone && (
                      <Group
                        gap="xs"
                        align="center"
                        wrap="nowrap"
                      >
                        <Box
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6.6 10.8a15.3 15.3 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2c1.2.5 2.5.7 3.5.7a1 1 0 011 1V19a1 1 0 01-1 1A17 17 0 014 4a1 1 0 011-1h3a1 1 0 011 1c0 1.1.2 2.2.7 3.5a1 1 0 01-.2 1.1L6.6 10.8z"
                              stroke="#20c997"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </Box>

                        <Text
                          size="xs"
                          c="dimmed"
                          style={{
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {doctor.phone}
                        </Text>
                      </Group>
                    )}

                    {/* Department */}

                    {doctor.department && (
                      <Group
                        gap="xs"
                        align="center"
                        wrap="nowrap"
                      >
                        <Box
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              stroke="#20c997"
                              strokeWidth="1.8"
                            />

                            <path
                              d="M9 22V12h6v10"
                              stroke="#20c997"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </Box>

                        <Text
                          size="xs"
                          c="dimmed"
                          lineClamp={2}
                          style={{
                            wordBreak:
                              "break-word",
                            minWidth: 0,
                          }}
                        >
                          {doctor.department}
                        </Text>
                      </Group>
                    )}

                    {/* Experience */}

                    {doctor.experience && (
                      <Group
                        gap="xs"
                        align="center"
                        wrap="nowrap"
                      >
                        <Box
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="#20c997"
                              strokeWidth="1.8"
                            />

                            <path
                              d="M12 7v5l3 3"
                              stroke="#20c997"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </Box>

                        <Text
                          size="xs"
                          c="dimmed"
                        >
                          {doctor.experience} yrs
                          experience
                        </Text>
                      </Group>
                    )}

                    {/* Gender */}

                    {doctor.gender && (
                      <Group
                        gap="xs"
                        align="center"
                        wrap="nowrap"
                      >
                        <Box
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="8"
                              r="4"
                              stroke="#20c997"
                              strokeWidth="1.8"
                            />

                            <path
                              d="M6 21v-1a6 6 0 0112 0v1"
                              stroke="#20c997"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </Box>

                        <Text
                          size="xs"
                          c="dimmed"
                          style={{
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {doctor.gender}
                        </Text>
                      </Group>
                    )}
                  </Stack>

                  {/* Delete Button */}

                  <Button
                    fullWidth
                    mt="md"
                    radius="xl"
                    size="sm"
                    color="red"
                    variant="light"
                    onClick={() =>
                      confirmDelete(doctor.id)
                    }
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Delete Doctor
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}

          {/* Empty State */}

          {filtered.length === 0 && (
            <Box
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "80px 20px",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  margin: "0 auto 16px",
                  display: "block",
                  opacity: 0.4,
                }}
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="#20c997"
                  strokeWidth="1.5"
                />

                <path
                  d="M6 21v-1a6 6 0 0112 0v1"
                  stroke="#20c997"
                  strokeWidth="1.5"
                />
              </svg>

              <Text
                size="lg"
                fw={600}
                c="dimmed"
              >
                No doctors found
              </Text>

              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                Try adjusting your search query
              </Text>
            </Box>
          )}
        </SimpleGrid>
      )}

      {/* Delete Modal */}

      <Modal
        opened={deleteModalOpen}
        onClose={() =>
          setDeleteModalOpen(false)
        }
        title={
          <Text
            fw={700}
            c="red"
            size="lg"
          >
            Confirm Delete
          </Text>
        }
        centered
        radius="xl"
        size="sm"
        overlayProps={{ blur: 3 }}
      >
        <Text c="dimmed" mb="lg">
          Are you sure you want to delete
          this doctor? This action cannot
          be undone.
        </Text>

        <Group
          justify="flex-end"
          gap="sm"
          wrap="wrap"
        >
          <Button
            variant="light"
            radius="xl"
            onClick={() =>
              setDeleteModalOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            color="red"
            radius="xl"
            onClick={handleDelete}
          >
            Yes, Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default AdminDoctor;