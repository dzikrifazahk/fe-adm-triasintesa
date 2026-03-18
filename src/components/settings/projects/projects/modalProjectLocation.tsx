import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projectService } from "@/services";
import { MapPin, Trash2, Pencil } from "lucide-react";
import { IAddProjectLocation, IProjectLocation } from "@/types/project";
import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import MapSsr from "@/components/custom/Maps/Map";
import Swal from "sweetalert2";
import { useLoading } from "@/context/loadingContext";

interface ModalProjectLocationProps {
  isOpen: boolean;
  title: string;
  detailData?: IProjectLocation[] | null;
  onClose: () => void;
  isGetData: (tableModal: string) => void;
  projectId: string;
}

export const ModalProjectLocation = ({
  isOpen,
  title,
  onClose,
  isGetData,
  detailData: detailDataProp,
  projectId,
}: ModalProjectLocationProps) => {
  // STATE
  const { setIsLoading } = useLoading();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [name, setName] = useState("");
  const [radius, setRadius] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailLocationData, setDetailLocationData] = useState<
    IProjectLocation[]
  >([]);

  useEffect(() => {
    if (detailDataProp) {
      setDetailLocationData(detailDataProp);
    }
  }, [detailDataProp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lat || !lng) {
      alert("Silakan pilih lokasi pada peta terlebih dahulu");
      return;
    }

    const payload: IAddProjectLocation = {
      name,
      radius,
      is_default: isDefault,
      latitude: String(lat),
      longitude: String(lng),
    };

    Swal.fire({
      title: editingId ? "Update lokasi ini?" : "Tambahkan lokasi baru?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: editingId ? "Ya, update" : "Ya, tambahkan",
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);

          if (editingId) {
            await projectService.changeProjectLocation(editingId, payload);
          } else {
            payload.project_id = projectId;
            await projectService.addProjectLocation(payload);
          }

          await handleIsGetDetailLocationData(projectId);
          isGetData(projectId);

          resetForm();

          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: editingId
              ? "Lokasi berhasil diperbarui"
              : "Lokasi berhasil ditambahkan",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            position: "top-right",
          });
        } catch (error) {
          console.error("Failed to submit project location:", error);
          Swal.fire("Error", "Gagal memproses lokasi proyek.", "error");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleIsGetDetailLocationData = async (projectId: string) => {
    try {
      const { data } = await projectService.getProjectLocations(projectId);
      setDetailLocationData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleClearMarker = () => {
    setMarker(null);
    setLat(null);
    setLng(null);
  };

  const resetForm = () => {
    setName("");
    setRadius("");
    setIsDefault(false);
    setMarker(null);
    setLat(null);
    setLng(null);
    setEditingId(null);
  };

  const handleEdit = (item: IProjectLocation) => {
    setEditingId(item?.id ?? "");
    setName(item.name);
    setRadius(item.radius);
    setIsDefault(item.is_default);
    setLat(Number(item.latitude));
    setLng(Number(item.longitude));
    setMarker([Number(item.latitude), Number(item.longitude)]);
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Hapus lokasi ini?",
      text: "Tindakan ini tidak dapat dibatalkan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          await projectService.deleteProjectLocation(id);
          await handleIsGetDetailLocationData(projectId);

          Swal.fire({
            icon: "success",
            title: "Dihapus",
            text: "Lokasi berhasil dihapus",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            position: "top-right",
          });
        } catch (error) {
          console.error("Failed to delete project location:", error);
          Swal.fire("Error", "Gagal menghapus lokasi proyek.", "error");
        } finally {
          setIsLoading(false);
        }
      } else {
        Swal.fire({
          icon: "info",
          title: "Dibatalkan",
          text: "Lokasi proyek batal dihapus",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          position: "top-right",
        });
      }
    });
  };

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={onClose}
          title={title}
          onSubmit={handleSubmit}
          onCancel={onClose}
        >
          <div className="flex flex-col gap-3 w-full pl-4 pr-4 md:pl-10 md:pr-10 pt-3">
            <div className="flex flex-col md:flex-row gap-5 ">
              {/* FORM */}
              <div className="w-full flex flex-col gap-3 ">
                <div className="w-full flex flex-col">
                  <Label className="font-bold text-md">
                    Nama Lokasi<Label className="text-red-500">*</Label>
                  </Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full flex flex-col">
                  <Label className="font-bold text-md">
                    Lokasi Utama<Label className="text-red-500">*</Label>
                  </Label>
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={isDefault}
                      onCheckedChange={(val) => setIsDefault(!!val)}
                    />{" "}
                    Ya
                  </div>
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label className="font-bold text-md">
                    Radius<Label className="text-red-500">*</Label>
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      className="w-1/2"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      required
                    />
                    <Label className="font-bold">KM</Label>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div>
                    <Label className="font-bold text-md">Pilih Lokasi</Label>
                    <Label className="text-sm text-gray-400">
                      Klik pada peta untuk memilih lokasi
                    </Label>
                  </div>
                  <MapSsr
                    marker={marker}
                    setMarker={setMarker}
                    onLocationSelect={(latitude, longitude) => {
                      setLat(latitude);
                      setLng(longitude);
                    }}
                  />
                </div>
                {marker && (
                  <>
                    <div className="w-full flex gap-2">
                      <div className="flex flex-col w-full">
                        <Label className="font-bold text-lg">Latitude</Label>
                        <Input type="text" value={String(lat)} disabled />
                      </div>
                      <div className="flex flex-col w-full">
                        <Label className="font-bold text-lg">Longitude</Label>
                        <Input type="text" value={String(lng)} disabled />
                      </div>
                    </div>
                    <div className="mt-1 flex gap-2 w-full">
                      <Button
                        onClick={handleClearMarker}
                        className="bg-red-500 hover:bg-red-600 flex-1 cursor-pointer"
                      >
                        Ulang Pengambilan Lokasi
                      </Button>
                      {editingId && (
                        <Button
                          onClick={resetForm}
                          className="bg-gray-500 hover:bg-gray-600 flex-1 cursor-pointer"
                        >
                          Batal Edit
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* LIST */}
              <div className="w-full flex flex-col gap-2">
                <Label className="font-bold text-xl">List Lokasi Proyek</Label>
                {!detailLocationData || detailLocationData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 border rounded-lg text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">
                      Belum ada lokasi proyek
                    </p>
                    <p className="text-xs">
                      Silakan tambahkan lokasi terlebih dahulu
                    </p>
                  </div>
                ) : (
                  detailLocationData.map((item) => (
                    <Card
                      key={item.id}
                      className={[item.is_default ? "border-emerald-500" : ""]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold">
                            {item.name}{" "}
                            {item.is_default && (
                              <span className="text-emerald-600 text-xs font-medium">
                                (utama)
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            {item.radius} KM
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            className="cursor-pointer"
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            className="cursor-pointer"
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item?.id ?? "");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-2">
                        <div>
                          <Label className="font-bold text-sm">Lat/Long</Label>
                          <p className="text-xs text-muted-foreground">
                            {item.latitude} / {item.longitude}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
